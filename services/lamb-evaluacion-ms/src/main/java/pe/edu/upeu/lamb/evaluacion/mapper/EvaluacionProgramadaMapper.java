package pe.edu.upeu.lamb.evaluacion.mapper;

import pe.edu.upeu.lamb.evaluacion.dto.EvaluacionProgramadaRequest;
import pe.edu.upeu.lamb.evaluacion.dto.EvaluacionProgramadaResponse;
import pe.edu.upeu.lamb.evaluacion.entity.EvaluacionProgramada;
import org.springframework.stereotype.Component;

@Component
public class EvaluacionProgramadaMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public EvaluacionProgramada toEntity(EvaluacionProgramadaRequest request) {
        return EvaluacionProgramada.builder()
                .idGrupo(request.getIdGrupo())
                .fecha(request.getFecha())
                .descripcion(request.getDescripcion())
                .unidad(request.getUnidad())
                .producto(request.getProducto())
                .nroSesiones(request.getNroSesiones())
                .orden(request.getOrden())
                .peso(request.getPeso())
                .build();
    }

    public EvaluacionProgramadaResponse toResponse(EvaluacionProgramada evaluacionProgramada) {
        return EvaluacionProgramadaResponse.builder()
                .id(evaluacionProgramada.getId())
                .idGrupo(evaluacionProgramada.getIdGrupo())
                .idComponente(evaluacionProgramada.getComponente().getId())
                .codigoComponente(evaluacionProgramada.getComponente().getCodigo())
                .fecha(evaluacionProgramada.getFecha())
                .descripcion(evaluacionProgramada.getDescripcion())
                .unidad(evaluacionProgramada.getUnidad())
                .producto(evaluacionProgramada.getProducto())
                .nroSesiones(evaluacionProgramada.getNroSesiones())
                .orden(evaluacionProgramada.getOrden())
                .peso(evaluacionProgramada.getPeso())
                .tipoComponente(evaluacionProgramada.getComponente().getTipo().name())
                .build();
    }
}
