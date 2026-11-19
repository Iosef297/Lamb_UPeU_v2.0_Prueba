package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.dto.AsignacionDocenteRequest;
import pe.edu.upeu.lamb.planificacion.dto.AsignacionDocenteResponse;
import pe.edu.upeu.lamb.planificacion.entity.AsignacionDocente;
import pe.edu.upeu.lamb.planificacion.entity.Grupo;
import pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo;
import pe.edu.upeu.lamb.planificacion.entity.RolDocente;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.mapper.AsignacionDocenteMapper;
import pe.edu.upeu.lamb.planificacion.repository.AsignacionDocenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CRUD 20 · Asignacion docente a grupo (detalle Grupo x Docente) fuera de la apertura.
 * Aplica las mismas reglas y candados que la apertura del grupo.
 */
@Service
@RequiredArgsConstructor
public class AsignacionDocenteService {

    private final AsignacionDocenteRepository asignacionDocenteRepository;
    private final AsignacionDocenteMapper asignacionDocenteMapper;
    private final GrupoService grupoService;
    private final ReglasGrupoService reglas;
    private final pe.edu.upeu.lamb.planificacion.mapper.GrupoMapper grupoMapper;
    private final pe.edu.upeu.lamb.planificacion.messaging.PlanificacionEventosProducer producer;

    @org.springframework.beans.factory.annotation.Value("${spring.application.name}")
    private String nombreServicio;

    static final String DOCENTES_ACTUALIZADOS = "grupo.docentes-actualizados";

    @Transactional(readOnly = true)
    public List<AsignacionDocenteResponse> listar(Long idGrupo) {
        List<AsignacionDocente> lista = idGrupo == null
                ? asignacionDocenteRepository.findAll()
                : asignacionDocenteRepository.findByGrupoId(idGrupo);
        return lista.stream().map(asignacionDocenteMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AsignacionDocenteResponse obtener(Long id) {
        return asignacionDocenteMapper.toResponse(buscarOFallar(id));
    }

    @Transactional
    public AsignacionDocenteResponse crear(AsignacionDocenteRequest request) {
        Grupo grupo = grupoService.buscarOFallar(request.getIdGrupo());
        AsignacionDocente asignacion = AsignacionDocente.builder().grupo(grupo).build();
        asignar(asignacion, request.getIdDocente(), request.getRol(), request.getHorasSemanales());
        aplicarPermisos(asignacion, request);
        grupo.getDocentes().add(asignacion);
        AsignacionDocente guardada = asignacionDocenteRepository.saveAndFlush(asignacion);
        publicarDocentes(grupo);
        return asignacionDocenteMapper.toResponse(guardada);
    }

    @Transactional
    public AsignacionDocenteResponse actualizar(Long id, AsignacionDocenteRequest request) {
        AsignacionDocente asignacion = buscarOFallar(id);
        if (!asignacion.getGrupo().getId().equals(request.getIdGrupo())) {
            throw new BusinessRuleException("Una asignacion no se mueve a otro grupo: eliminala y creala en el grupo destino");
        }
        asignar(asignacion, request.getIdDocente(), request.getRol(), request.getHorasSemanales());
        aplicarPermisos(asignacion, request);
        asignacionDocenteRepository.saveAndFlush(asignacion);
        publicarDocentes(asignacion.getGrupo());
        return asignacionDocenteMapper.toResponse(asignacion);
    }

    @Transactional
    public void eliminar(Long id) {
        AsignacionDocente asignacion = buscarOFallar(id);
        grupoService.validarNoAnulado(asignacion.getGrupo());
        asignacion.getGrupo().getDocentes().remove(asignacion);
        publicarDocentes(asignacion.getGrupo());
    }

    // Lo usa la aprobacion de la solicitud de cambio de docente (CRUD 30)
    @Transactional
    public void reasignar(AsignacionDocente asignacion, Long idDocente, RolDocente rol, int horasSemanales) {
        asignar(asignacion, idDocente, rol, horasSemanales);
        asignacionDocenteRepository.saveAndFlush(asignacion);
        publicarDocentes(asignacion.getGrupo());
    }

    // evaluacion guarda una copia de los docentes del grupo para validar quien registra notas y asistencia
    private void publicarDocentes(Grupo grupo) {
        producer.publicarTrasCommit(grupoMapper.toGrupoAbiertoEvento(grupo, DOCENTES_ACTUALIZADOS, nombreServicio));
    }

    private void aplicarPermisos(AsignacionDocente asignacion, AsignacionDocenteRequest request) {
        asignacion.setGestionaNota(ReglasGrupoService.permiso(request.getGestionaNota(), request.getRol() != pe.edu.upeu.lamb.planificacion.entity.RolDocente.PRACTICA));
        asignacion.setGestionaAsistencia(ReglasGrupoService.permiso(request.getGestionaAsistencia(), true));
        asignacion.setVerHorario(ReglasGrupoService.permiso(request.getVerHorario(), true));
        asignacion.setMuestraPortal(ReglasGrupoService.permiso(request.getMuestraPortal(), true));
    }

    AsignacionDocente buscarOFallar(Long id) {
        return asignacionDocenteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignacion docente no encontrada: " + id));
    }

    private void asignar(AsignacionDocente asignacion, Long idDocente, RolDocente rol, int horasSemanales) {
        Grupo grupo = asignacion.getGrupo();
        grupoService.validarNoAnulado(grupo);
        Long idExcluido = asignacion.getId() == null ? ReglasGrupoService.SIN_ID : asignacion.getId();
        Long idPeriodo = grupo.getPeriodo().getId();
        reglas.bloquearDocente(idDocente);

        for (AsignacionDocente otra : grupo.getDocentes()) {
            if (idExcluido.equals(otra.getId())) {
                continue;
            }
            if (otra.getIdDocente().equals(idDocente)) {
                throw new BusinessRuleException("El docente " + idDocente + " ya esta asignado al grupo " + grupo.getId());
            }
            if (rol == RolDocente.TITULAR && otra.getRol() == RolDocente.TITULAR) {
                throw new BusinessRuleException("El grupo " + grupo.getId() + " ya tiene un docente TITULAR");
            }
        }
        // Solo los bloques que dicta esta asignacion (o los que no tienen docente propio)
        for (HorarioGrupo h : grupo.getHorarios()) {
            boolean loDicta = h.getAsignacionDocente() == null || h.getAsignacionDocente() == asignacion;
            if (Boolean.TRUE.equals(h.getActivo()) && loDicta) {
                reglas.validarDocenteLibre(idDocente, idPeriodo, grupo.getId(), h.getDiaSemana(), h.getHoraInicio(), h.getHoraFin(),
                        h.getFechaInicio(), h.getFechaFin());
            }
        }
        reglas.validarCargaLectiva(idDocente, idPeriodo, horasSemanales, idExcluido);
        asignacion.setIdDocente(idDocente);
        asignacion.setRol(rol);
        asignacion.setHorasSemanales(horasSemanales);
    }
}
