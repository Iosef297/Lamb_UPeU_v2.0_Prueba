package pe.edu.upeu.lamb.planificacion.mapper;

import pe.edu.upeu.lamb.planificacion.dto.HitoCalendarioRequest;
import pe.edu.upeu.lamb.planificacion.dto.HitoCalendarioResponse;
import pe.edu.upeu.lamb.planificacion.entity.HitoCalendario;
import org.springframework.stereotype.Component;

@Component
public class HitoCalendarioMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public HitoCalendario toEntity(HitoCalendarioRequest request) {
        return HitoCalendario.builder()
                .tipo(request.getTipo())
                .nombre(request.getNombre().trim())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .build();
    }

    // Campos opcionales de la actividad (A2); si no vienen quedan los valores por defecto
    public void aplicarDetalle(HitoCalendario hito, HitoCalendarioRequest request) {
        hito.setDescripcion(request.getDescripcion());
        hito.setIdPrograma(request.getIdPrograma());
        if (request.getAreaResponsable() != null) {
            hito.setAreaResponsable(request.getAreaResponsable());
        }
        if (request.getEstado() != null) {
            hito.setEstado(request.getEstado());
        }
        if (request.getVisibleAlumno() != null) {
            hito.setVisibleAlumno(request.getVisibleAlumno());
        }
    }

    public HitoCalendarioResponse toResponse(HitoCalendario hitoCalendario) {
        return HitoCalendarioResponse.builder()
                .id(hitoCalendario.getId())
                .idCalendario(hitoCalendario.getCalendario().getId())
                .nombreCalendario(hitoCalendario.getCalendario().getNombre())
                .tipo(hitoCalendario.getTipo())
                .nombre(hitoCalendario.getNombre())
                .fechaInicio(hitoCalendario.getFechaInicio())
                .fechaFin(hitoCalendario.getFechaFin())
                .descripcion(hitoCalendario.getDescripcion())
                .areaResponsable(hitoCalendario.getAreaResponsable())
                .idPrograma(hitoCalendario.getIdPrograma())
                .idSede(hitoCalendario.getCalendario().getIdSede())
                .estado(hitoCalendario.getEstado())
                .visibleAlumno(hitoCalendario.getVisibleAlumno())
                .build();
    }
}
