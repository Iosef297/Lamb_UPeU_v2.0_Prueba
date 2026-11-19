package pe.edu.upeu.lamb.evaluacion.service;

import pe.edu.upeu.lamb.evaluacion.dto.RegistroAsistenciaRequest;
import pe.edu.upeu.lamb.evaluacion.dto.RegistroAsistenciaResponse;
import pe.edu.upeu.lamb.evaluacion.entity.RegistroAsistencia;
import pe.edu.upeu.lamb.evaluacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.evaluacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.evaluacion.mapper.RegistroAsistenciaMapper;
import pe.edu.upeu.lamb.evaluacion.repository.RegistroAsistenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistroAsistenciaService {

    private final RegistroAsistenciaRepository registroAsistenciaRepository;
    private final RegistroAsistenciaMapper registroAsistenciaMapper;
    private final pe.edu.upeu.lamb.evaluacion.repository.ActaRepository actaRepository;
    private final DocenteGrupoService docenteGrupoService;

    @Transactional(readOnly = true)
    public List<RegistroAsistenciaResponse> listar(Long idGrupo) {
        List<RegistroAsistencia> lista = idGrupo == null
                ? registroAsistenciaRepository.findAll()
                : registroAsistenciaRepository.findByIdGrupo(idGrupo);
        return lista.stream().map(registroAsistenciaMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RegistroAsistenciaResponse obtener(Long id) {
        return registroAsistenciaMapper.toResponse(buscarOFallar(id));
    }

    @Transactional
    public RegistroAsistenciaResponse crear(RegistroAsistenciaRequest request) {
        validarSesionUnica(request, null);
        validarAsistenciaHabilitada(request.getIdGrupo());
        RegistroAsistencia registroAsistencia = registroAsistenciaMapper.toEntity(request);
        return registroAsistenciaMapper.toResponse(registroAsistenciaRepository.save(registroAsistencia));
    }

    @Transactional
    public RegistroAsistenciaResponse actualizar(Long id, RegistroAsistenciaRequest request) {
        RegistroAsistencia registroAsistencia = buscarOFallar(id);
        validarSesionUnica(request, id);
        validarAsistenciaHabilitada(registroAsistencia.getIdGrupo());
        validarAsistenciaHabilitada(request.getIdGrupo());
        registroAsistencia.setIdGrupo(request.getIdGrupo());
        registroAsistencia.setIdPersona(request.getIdPersona());
        registroAsistencia.setIdSesionClase(request.getIdSesionClase());
        registroAsistencia.setFecha(request.getFecha());
        registroAsistencia.setEstado(request.getEstado());
        registroAsistencia.setTipoHorario(pe.edu.upeu.lamb.evaluacion.mapper.RegistroAsistenciaMapper.tipoHorario(request));
        return registroAsistenciaMapper.toResponse(registroAsistenciaRepository.save(registroAsistencia));
    }

    @Transactional
    public void eliminar(Long id) {
        RegistroAsistencia registro = buscarOFallar(id);
        validarAsistenciaHabilitada(registro.getIdGrupo());
        registroAsistenciaRepository.delete(registro);
    }

    // Varias sesiones por dia estan permitidas (V6), pero un estudiante tiene una sola asistencia por sesion
    // y tipo de horario (Teoria y Practica se marcan aparte, como en el LAMB):
    // un duplicado inflaria el conteo de faltas que usa la inhabilitacion del 30 %.
    private void validarSesionUnica(RegistroAsistenciaRequest request, Long id) {
        if (request.getIdSesionClase() == null) {
            return;
        }
        var tipo = pe.edu.upeu.lamb.evaluacion.mapper.RegistroAsistenciaMapper.tipoHorario(request);
        boolean duplicado = id == null
                ? registroAsistenciaRepository.existsByIdGrupoAndIdPersonaAndIdSesionClaseAndTipoHorario(
                        request.getIdGrupo(), request.getIdPersona(), request.getIdSesionClase(), tipo)
                : registroAsistenciaRepository.existsByIdGrupoAndIdPersonaAndIdSesionClaseAndTipoHorarioAndIdNot(
                        request.getIdGrupo(), request.getIdPersona(), request.getIdSesionClase(), tipo, id);
        if (duplicado) {
            throw new BusinessRuleException("El estudiante " + request.getIdPersona()
                    + " ya tiene asistencia de " + tipo + " registrada en la sesion de clase " + request.getIdSesionClase());
        }
    }

    private void validarAsistenciaHabilitada(Long idGrupo) {
        docenteGrupoService.validarPuedeAsistencia(idGrupo);
        actaRepository.findByIdGrupo(idGrupo)
                .filter(a -> !Boolean.TRUE.equals(a.getAsistenciaHabilitada()))
                .filter(a -> !pe.edu.upeu.lamb.evaluacion.config.JwtClaims.esGestion())
                .ifPresent(a -> {
                    throw new BusinessRuleException("El registro de asistencia del grupo " + idGrupo + " esta cerrado; pide al coordinador que lo habilite");
                });
    }

    RegistroAsistencia buscarOFallar(Long id) {
        return registroAsistenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de asistencia no encontrado: " + id));
    }
}
