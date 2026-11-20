package pe.edu.upeu.lamb.admision.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.upeu.lamb.admision.dto.CalificacionResponse;
import pe.edu.upeu.lamb.admision.entity.CalificacionExamen;
import pe.edu.upeu.lamb.admision.port.PersonaPort;

@Component
@RequiredArgsConstructor
public class CalificacionMapper {
    private final PersonaPort personaPort;

    public CalificacionResponse toResponse(CalificacionExamen c) {
        String nombrePostulante = personaPort.consultarPorId(c.getPostulante().getIdPersona())
                .map(PersonaPort.PersonaInfo::nombreCompleto)
                .orElse(null);
        return CalificacionResponse.builder()
                .id(c.getId())
                .idExamen(c.getExamen().getId())
                .codigoExamen(c.getExamen().getCodigo())
                .nombreExamen(c.getExamen().getNombre())
                .idPostulante(c.getPostulante().getId())
                .codigoPostulante(c.getPostulante().getCodigoPostulante())
                .nombrePostulante(nombrePostulante)
                .puntajeTotal(c.getPuntajeTotal())
                .puntajeAptitud(c.getPuntajeAptitud())
                .puntajeConocimiento(c.getPuntajeConocimiento())
                .respuestasCorrectas(c.getRespuestasCorrectas())
                .respuestasIncorrectas(c.getRespuestasIncorrectas())
                .respuestasBlanco(c.getRespuestasBlanco())
                .ordenMerito(c.getOrdenMerito())
                .idSupervisor(c.getIdSupervisor())
                .idEncargado(c.getIdEncargado())
                .observacion(c.getObservacion())
                .fechaCalificacion(c.getFechaCalificacion())
                .horaEntrega(c.getHoraEntrega())
                .build();
    }
}
