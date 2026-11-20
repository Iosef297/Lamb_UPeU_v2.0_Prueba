package pe.edu.upeu.lamb.matricula.mapper;

import pe.edu.upeu.lamb.matricula.dto.ModalidadMatriculaRequest;
import pe.edu.upeu.lamb.matricula.dto.ModalidadMatriculaResponse;
import pe.edu.upeu.lamb.matricula.entity.ModalidadMatricula;
import org.springframework.stereotype.Component;

@Component
public class ModalidadMatriculaMapper {

    public ModalidadMatricula toEntity(ModalidadMatriculaRequest request) {
        return ModalidadMatricula.builder()
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .activo(request.getActivo())
                .idModalidadEstudio(request.getIdModalidadEstudio())
                .articuloLegal(request.getArticuloLegal())
                .creditosMinimos(request.getCreditosMinimos())
                .requierePago(request.getRequierePago())
                .diasHabilesLimite(request.getDiasHabilesLimite())
                .maxVecesDesaprobado(request.getMaxVecesDesaprobado())
                .build();
    }

    public void actualizarEntity(ModalidadMatricula entity, ModalidadMatriculaRequest request) {
        entity.setCodigo(request.getCodigo());
        entity.setNombre(request.getNombre());
        entity.setDescripcion(request.getDescripcion());
        entity.setActivo(request.getActivo());
        entity.setIdModalidadEstudio(request.getIdModalidadEstudio());
        entity.setArticuloLegal(request.getArticuloLegal());
        entity.setCreditosMinimos(request.getCreditosMinimos());
        entity.setRequierePago(request.getRequierePago());
        entity.setDiasHabilesLimite(request.getDiasHabilesLimite());
        entity.setMaxVecesDesaprobado(request.getMaxVecesDesaprobado());
    }

    public ModalidadMatriculaResponse toResponse(ModalidadMatricula entity) {
        return ModalidadMatriculaResponse.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .activo(entity.getActivo())
                .idModalidadEstudio(entity.getIdModalidadEstudio())
                .articuloLegal(entity.getArticuloLegal())
                .creditosMinimos(entity.getCreditosMinimos())
                .requierePago(entity.getRequierePago())
                .diasHabilesLimite(entity.getDiasHabilesLimite())
                .maxVecesDesaprobado(entity.getMaxVecesDesaprobado())
                .build();
    }
}
