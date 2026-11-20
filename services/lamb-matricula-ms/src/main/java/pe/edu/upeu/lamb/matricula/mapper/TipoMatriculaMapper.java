package pe.edu.upeu.lamb.matricula.mapper;

import pe.edu.upeu.lamb.matricula.dto.TipoMatriculaRequest;
import pe.edu.upeu.lamb.matricula.dto.TipoMatriculaResponse;
import pe.edu.upeu.lamb.matricula.entity.TipoMatricula;
import org.springframework.stereotype.Component;

@Component
public class TipoMatriculaMapper {

    public TipoMatricula toEntity(TipoMatriculaRequest request) {
        return TipoMatricula.builder()
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .activo(request.getActivo())
                .articuloLegal(request.getArticuloLegal())
                .creditosMinimos(request.getCreditosMinimos())
                .requierePago(request.getRequierePago())
                .diasHabilesLimite(request.getDiasHabilesLimite())
                .maxVecesDesaprobado(request.getMaxVecesDesaprobado())
                .build();
    }

    public void actualizarEntity(TipoMatricula entity, TipoMatriculaRequest request) {
        entity.setCodigo(request.getCodigo());
        entity.setNombre(request.getNombre());
        entity.setDescripcion(request.getDescripcion());
        entity.setActivo(request.getActivo());
        entity.setArticuloLegal(request.getArticuloLegal());
        entity.setCreditosMinimos(request.getCreditosMinimos());
        entity.setRequierePago(request.getRequierePago());
        entity.setDiasHabilesLimite(request.getDiasHabilesLimite());
        entity.setMaxVecesDesaprobado(request.getMaxVecesDesaprobado());
    }

    public TipoMatriculaResponse toResponse(TipoMatricula entity) {
        return TipoMatriculaResponse.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .activo(entity.getActivo())
                .articuloLegal(entity.getArticuloLegal())
                .creditosMinimos(entity.getCreditosMinimos())
                .requierePago(entity.getRequierePago())
                .diasHabilesLimite(entity.getDiasHabilesLimite())
                .maxVecesDesaprobado(entity.getMaxVecesDesaprobado())
                .build();
    }
}
