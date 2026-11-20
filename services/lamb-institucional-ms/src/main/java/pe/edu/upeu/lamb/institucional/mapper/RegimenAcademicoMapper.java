package pe.edu.upeu.lamb.institucional.mapper;

import org.springframework.stereotype.Component;
import pe.edu.upeu.lamb.institucional.dto.RegimenAcademicoRequest;
import pe.edu.upeu.lamb.institucional.dto.RegimenAcademicoResponse;
import pe.edu.upeu.lamb.institucional.entity.RegimenAcademico;

@Component
public class RegimenAcademicoMapper {

    public RegimenAcademico toEntity(RegimenAcademicoRequest request) {
        return RegimenAcademico.builder()
                .nombre(request.getNombre())
                .anio(request.getAnio())
                .descripcion(request.getDescripcion())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .periodosPorAnio(request.getPeriodosPorAnio())
                .estado(request.getEstado() != null ? request.getEstado() : "Planificado")
                .idTipoPeriodo(request.getIdTipoPeriodo())
                .build();
    }

    public RegimenAcademicoResponse toResponse(RegimenAcademico entity) {
        return RegimenAcademicoResponse.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .anio(entity.getAnio())
                .descripcion(entity.getDescripcion())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .periodosPorAnio(entity.getPeriodosPorAnio())
                .estado(entity.getEstado())
                .idTipoPeriodo(entity.getIdTipoPeriodo())
                .build();
    }
}
