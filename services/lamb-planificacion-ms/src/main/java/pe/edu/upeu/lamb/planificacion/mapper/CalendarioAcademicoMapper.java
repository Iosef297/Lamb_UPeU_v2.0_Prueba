package pe.edu.upeu.lamb.planificacion.mapper;

import pe.edu.upeu.lamb.planificacion.dto.CalendarioAcademicoRequest;
import pe.edu.upeu.lamb.planificacion.dto.CalendarioAcademicoResponse;
import pe.edu.upeu.lamb.planificacion.entity.CalendarioAcademico;
import org.springframework.stereotype.Component;

@Component
public class CalendarioAcademicoMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public CalendarioAcademico toEntity(CalendarioAcademicoRequest request) {
        return CalendarioAcademico.builder()
                .idSede(request.getIdSede())
                .nombre(request.getNombre().trim())
                .resolucion(request.getResolucion())
                .estado(request.getEstado())
                .urlDocumento(blancoANull(request.getUrlDocumento()))
                .nombreArchivo(blancoANull(request.getNombreArchivo()))
                .modoHorarioAlumno(request.getModoHorarioAlumno() == null ? "HMC" : request.getModoHorarioAlumno())
                .build();
    }

    public CalendarioAcademicoResponse toResponse(CalendarioAcademico calendarioAcademico) {
        return CalendarioAcademicoResponse.builder()
                .id(calendarioAcademico.getId())
                .idPeriodo(calendarioAcademico.getPeriodo().getId())
                .codigoPeriodo(calendarioAcademico.getPeriodo().getCodigo())
                .idSede(calendarioAcademico.getIdSede())
                .nombre(calendarioAcademico.getNombre())
                .resolucion(calendarioAcademico.getResolucion())
                .estado(calendarioAcademico.getEstado())
                .urlDocumento(calendarioAcademico.getUrlDocumento())
                .nombreArchivo(calendarioAcademico.getNombreArchivo())
                .modoHorarioAlumno(calendarioAcademico.getModoHorarioAlumno())
                .build();
    }

    public static String blancoANull(String v) {
        return v == null || v.isBlank() ? null : v.trim();
    }
}
