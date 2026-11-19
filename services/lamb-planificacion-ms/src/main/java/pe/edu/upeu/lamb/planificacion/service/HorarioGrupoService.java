package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.dto.HorarioGrupoRequest;
import pe.edu.upeu.lamb.planificacion.dto.HorarioGrupoResponse;
import pe.edu.upeu.lamb.planificacion.entity.Ambiente;
import pe.edu.upeu.lamb.planificacion.entity.AsignacionDocente;
import pe.edu.upeu.lamb.planificacion.entity.DiaSemana;
import pe.edu.upeu.lamb.planificacion.entity.Grupo;
import pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.mapper.HorarioGrupoMapper;
import pe.edu.upeu.lamb.planificacion.repository.HorarioGrupoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

/**
 * CRUD 17 · Horario de grupo (detalle Grupo x Ambiente) fuera de la apertura.
 * Aplica las mismas reglas y candados que la apertura del grupo.
 */
@Service
@RequiredArgsConstructor
public class HorarioGrupoService {

    private final HorarioGrupoRepository horarioGrupoRepository;
    private final HorarioGrupoMapper horarioGrupoMapper;
    private final GrupoService grupoService;
    private final ReglasGrupoService reglas;

    @Transactional(readOnly = true)
    public List<HorarioGrupoResponse> listar(Long idGrupo) {
        List<HorarioGrupo> lista = idGrupo == null
                ? horarioGrupoRepository.findAll()
                : horarioGrupoRepository.findByGrupoId(idGrupo);
        return lista.stream().map(horarioGrupoMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public HorarioGrupoResponse obtener(Long id) {
        return horarioGrupoMapper.toResponse(buscarOFallar(id));
    }

    @Transactional
    public HorarioGrupoResponse crear(HorarioGrupoRequest request) {
        Grupo grupo = grupoService.buscarOFallar(request.getIdGrupo());
        grupoService.validarNoAnulado(grupo);
        HorarioGrupo horario = HorarioGrupo.builder()
                .grupo(grupo)
                .idPeriodo(grupo.getPeriodo().getId())
                .activo(true)
                .build();
        asignarVigencia(horario, request);
        programar(horario, request.getIdAmbiente(), request.getDiaSemana(), request.getHoraInicio(), request.getHoraFin());
        grupo.getHorarios().add(horario);
        return horarioGrupoMapper.toResponse(horarioGrupoRepository.saveAndFlush(horario));
    }

    @Transactional
    public HorarioGrupoResponse actualizar(Long id, HorarioGrupoRequest request) {
        HorarioGrupo horario = buscarOFallar(id);
        if (!horario.getGrupo().getId().equals(request.getIdGrupo())) {
            throw new BusinessRuleException("Un horario no se mueve a otro grupo: eliminalo y crealo en el grupo destino");
        }
        asignarVigencia(horario, request);
        reprogramar(horario, request.getIdAmbiente(), request.getDiaSemana(), request.getHoraInicio(), request.getHoraFin());
        return horarioGrupoMapper.toResponse(horario);
    }

    @Transactional
    public void eliminar(Long id) {
        HorarioGrupo horario = buscarOFallar(id);
        Grupo grupo = horario.getGrupo();
        grupoService.validarNoAnulado(grupo);
        long activos = grupo.getHorarios().stream().filter(h -> Boolean.TRUE.equals(h.getActivo())).count();
        if (activos <= 1) {
            throw new BusinessRuleException("El grupo " + grupo.getId() + " debe conservar al menos un horario");
        }
        grupo.getHorarios().remove(horario);
    }

    /**
     * Cambia ambiente, dia u horas de un horario existente. Lo usan el PUT y la aprobacion
     * de las solicitudes de cambio de horario (CRUD 31) y de cambio de aula (CRUD 32).
     */
    @Transactional
    public void reprogramar(HorarioGrupo horario, Long idAmbiente, DiaSemana dia, LocalTime horaInicio, LocalTime horaFin) {
        grupoService.validarNoAnulado(horario.getGrupo());
        programar(horario, idAmbiente, dia, horaInicio, horaFin);
        horarioGrupoRepository.saveAndFlush(horario);
    }

    // Tipo, subgrupo, docente que dicta, modulo y fechas del bloque (las fechas salen del modulo si no se envian)
    private void asignarVigencia(HorarioGrupo horario, HorarioGrupoRequest request) {
        Grupo grupo = horario.getGrupo();
        pe.edu.upeu.lamb.planificacion.entity.ModuloPeriodo modulo = reglas.modulo(request.getIdModulo(), horario.getIdPeriodo());
        java.time.LocalDate inicio = request.getFechaInicio() != null ? request.getFechaInicio() : modulo == null ? null : modulo.getFechaInicio();
        java.time.LocalDate fin = request.getFechaFin() != null ? request.getFechaFin() : modulo == null ? null : modulo.getFechaFin();
        reglas.validarFechas(inicio, fin);
        AsignacionDocente dicta = null;
        if (request.getIdAsignacionDocente() != null) {
            dicta = grupo.getDocentes().stream().filter(a -> request.getIdAsignacionDocente().equals(a.getId())).findFirst()
                    .orElseThrow(() -> new BusinessRuleException("La asignacion docente " + request.getIdAsignacionDocente() + " no es del grupo " + grupo.getId()));
        }
        horario.setModulo(modulo);
        horario.setFechaInicio(inicio);
        horario.setFechaFin(fin);
        horario.setTipoHorario(request.getTipoHorario() == null ? "TEORIA" : request.getTipoHorario());
        horario.setNumeroSubgrupo(request.getNumeroSubgrupo());
        horario.setAsignacionDocente(dicta);
    }

    HorarioGrupo buscarOFallar(Long id) {
        return horarioGrupoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horario de grupo no encontrado: " + id));
    }

    private void programar(HorarioGrupo horario, Long idAmbiente, DiaSemana dia, LocalTime horaInicio, LocalTime horaFin) {
        Grupo grupo = horario.getGrupo();
        Long idExcluido = horario.getId() == null ? ReglasGrupoService.SIN_ID : horario.getId();
        reglas.validarRango(horaInicio, horaFin);
        // Sin ambiente = "Por confirmar"
        Ambiente ambiente = idAmbiente == null ? null : reglas.reservarAmbiente(idAmbiente, grupo.getCupoMaximo());
        List<AsignacionDocente> dictan = horario.getAsignacionDocente() != null ? List.of(horario.getAsignacionDocente()) : grupo.getDocentes();
        dictan.stream().map(AsignacionDocente::getIdDocente).sorted().forEach(reglas::bloquearDocente);

        HorarioGrupo propuesto = HorarioGrupo.builder()
                .diaSemana(dia).horaInicio(horaInicio).horaFin(horaFin)
                .fechaInicio(horario.getFechaInicio()).fechaFin(horario.getFechaFin())
                .asignacionDocente(horario.getAsignacionDocente())
                .build();
        reglas.validarSinCruceEnGrupo(grupo, propuesto, idExcluido);
        reglas.validarAmbienteLibre(ambiente, horario.getIdPeriodo(), dia, horaInicio, horaFin,
                horario.getFechaInicio(), horario.getFechaFin(), idExcluido);
        for (AsignacionDocente docente : dictan) {
            reglas.validarDocenteLibre(docente.getIdDocente(), horario.getIdPeriodo(), grupo.getId(), dia, horaInicio, horaFin,
                    horario.getFechaInicio(), horario.getFechaFin());
        }
        horario.setAmbiente(ambiente);
        horario.setDiaSemana(dia);
        horario.setHoraInicio(horaInicio);
        horario.setHoraFin(horaFin);
    }
}
