package pe.edu.upeu.lamb.planificacion.mapper;

import pe.edu.upeu.lamb.planificacion.dto.CursoIntensivoRequest;
import pe.edu.upeu.lamb.planificacion.dto.CursoIntensivoResponse;
import pe.edu.upeu.lamb.planificacion.entity.CursoIntensivo;
import pe.edu.upeu.lamb.planificacion.entity.EstadoCursoIntensivo;
import org.springframework.stereotype.Component;

@Component
public class CursoIntensivoMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio; todo curso intensivo nace EN_CONVOCATORIA
    public CursoIntensivo toEntity(CursoIntensivoRequest request) {
        return CursoIntensivo.builder()
                .cupoMinimo(request.getCupoMinimo())
                .cupoMaximo(request.getCupoMaximo())
                .estado(EstadoCursoIntensivo.EN_CONVOCATORIA)
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .build();
    }

    public CursoIntensivoResponse toResponse(CursoIntensivo c) {
        return CursoIntensivoResponse.builder()
                .id(c.getId())
                .idPeriodo(c.getPeriodo().getId())
                .codigoPeriodo(c.getPeriodo().getCodigo())
                .idCurso(c.getCurso().getId())
                .codigoCurso(c.getCurso().getCodigo())
                .cupoMinimo(c.getCupoMinimo())
                .cupoMaximo(c.getCupoMaximo())
                .estado(c.getEstado())
                .fechaInicio(c.getFechaInicio())
                .fechaFin(c.getFechaFin())
                .build();
    }
}
