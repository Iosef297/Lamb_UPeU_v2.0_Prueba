package pe.edu.upeu.lamb.curriculo.mapper;

import pe.edu.upeu.lamb.curriculo.dto.EquivalenciaPlanRequest;
import pe.edu.upeu.lamb.curriculo.dto.EquivalenciaPlanResponse;
import pe.edu.upeu.lamb.curriculo.entity.EquivalenciaPlan;
import org.springframework.stereotype.Component;

@Component
public class EquivalenciaPlanMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public EquivalenciaPlan toEntity(EquivalenciaPlanRequest request) {
        return EquivalenciaPlan.builder()
                .tipo(request.getTipo())
                .observacion(request.getObservacion())
                .build();
    }

    public EquivalenciaPlanResponse toResponse(EquivalenciaPlan equivalenciaPlan) {
        return EquivalenciaPlanResponse.builder()
                .id(equivalenciaPlan.getId())
                .idPlanCursoOrigen(equivalenciaPlan.getPlanCursoOrigen().getId())
                .idPlanCursoDestino(equivalenciaPlan.getPlanCursoDestino().getId())
                .tipo(equivalenciaPlan.getTipo())
                .observacion(equivalenciaPlan.getObservacion())
                .codigoCursoDestino(equivalenciaPlan.getPlanCursoDestino().getCodigoCurso())
                .nombreCursoDestino(equivalenciaPlan.getPlanCursoDestino().getNombreCurso())
                .idPlanDestino(equivalenciaPlan.getPlanCursoDestino().getPlan().getId())
                .versionPlanDestino(equivalenciaPlan.getPlanCursoDestino().getPlan().getVersion())
                .idProgramaDestino(equivalenciaPlan.getPlanCursoDestino().getPlan().getIdPrograma())
                .nombrePlanDestino(equivalenciaPlan.getPlanCursoDestino().getPlan().getNombre())
                .cicloDestino(equivalenciaPlan.getPlanCursoDestino().getCiclo())
                .tipoCursoDestino(equivalenciaPlan.getPlanCursoDestino().getTipo() == null ? null : equivalenciaPlan.getPlanCursoDestino().getTipo().getNombre())
                .idDepartamentoDestino(equivalenciaPlan.getPlanCursoDestino().getCursoCatalogo().getIdDepartamento())
                .creditosDestino(equivalenciaPlan.getPlanCursoDestino().getCreditos())
                .horasTeoriaDestino(equivalenciaPlan.getPlanCursoDestino().getCursoCatalogo().getHorasTeoria())
                .horasPracticaDestino(equivalenciaPlan.getPlanCursoDestino().getCursoCatalogo().getHorasPractica())
                .horasNoPresencialesDestino(equivalenciaPlan.getPlanCursoDestino().getCursoCatalogo().getHorasNoPresenciales())
                .horasTotalesDestino(equivalenciaPlan.getPlanCursoDestino().getCursoCatalogo().getHorasTotales())
                .build();
    }
}
