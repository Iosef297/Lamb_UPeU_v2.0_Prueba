package pe.edu.upeu.lamb.evaluacion.mapper;

import pe.edu.upeu.lamb.evaluacion.dto.RegistroAsistenciaRequest;
import pe.edu.upeu.lamb.evaluacion.dto.RegistroAsistenciaResponse;
import pe.edu.upeu.lamb.evaluacion.entity.RegistroAsistencia;
import org.springframework.stereotype.Component;

@Component
public class RegistroAsistenciaMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public RegistroAsistencia toEntity(RegistroAsistenciaRequest request) {
        return RegistroAsistencia.builder()
                .idGrupo(request.getIdGrupo())
                .idPersona(request.getIdPersona())
                .idSesionClase(request.getIdSesionClase())
                .fecha(request.getFecha())
                .estado(request.getEstado())
                .tipoHorario(tipoHorario(request))
                .fechaRegistro(java.time.LocalDateTime.now())
                .build();
    }

    public static pe.edu.upeu.lamb.evaluacion.entity.TipoHorarioAsistencia tipoHorario(RegistroAsistenciaRequest request) {
        return request.getTipoHorario() == null
                ? pe.edu.upeu.lamb.evaluacion.entity.TipoHorarioAsistencia.TEORIA : request.getTipoHorario();
    }

    public RegistroAsistenciaResponse toResponse(RegistroAsistencia registroAsistencia) {
        return RegistroAsistenciaResponse.builder()
                .id(registroAsistencia.getId())
                .idGrupo(registroAsistencia.getIdGrupo())
                .idPersona(registroAsistencia.getIdPersona())
                .idSesionClase(registroAsistencia.getIdSesionClase())
                .fecha(registroAsistencia.getFecha())
                .estado(registroAsistencia.getEstado())
                .tipoHorario(registroAsistencia.getTipoHorario())
                .build();
    }
}
