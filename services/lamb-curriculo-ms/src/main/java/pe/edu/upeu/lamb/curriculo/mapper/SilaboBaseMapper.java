package pe.edu.upeu.lamb.curriculo.mapper;

import pe.edu.upeu.lamb.curriculo.dto.SilaboBaseRequest;
import pe.edu.upeu.lamb.curriculo.dto.SilaboBaseResponse;
import pe.edu.upeu.lamb.curriculo.entity.SilaboBase;
import org.springframework.stereotype.Component;

@Component
public class SilaboBaseMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public SilaboBase toEntity(SilaboBaseRequest request) {
        return SilaboBase.builder()
                .version(request.getVersion().trim())
                .competencias(request.getCompetencias())
                .metodologia(request.getMetodologia())
                .evaluacion(request.getEvaluacion())
                .bibliografia(request.getBibliografia())
                .estado(request.getEstado())
                .idCompetenciaEspecifica(request.getIdCompetenciaEspecifica())
                .idCompetenciaGeneral(request.getIdCompetenciaGeneral())
                .resultadoAprendizaje(request.getResultadoAprendizaje())
                .productoAcademico(request.getProductoAcademico())
                .descripcionProducto(request.getDescripcionProducto())
                .recursos(request.getRecursos())
                .referenciasBasicas(request.getReferenciasBasicas())
                .referenciasComplementarias(request.getReferenciasComplementarias())
                .enlacesInternet(request.getEnlacesInternet())
                .notaMinimaAprobatoria(request.getNotaMinimaAprobatoria())
                .build();
    }

    public SilaboBaseResponse toResponse(SilaboBase silaboBase) {
        return SilaboBaseResponse.builder()
                .id(silaboBase.getId())
                .idCurso(silaboBase.getCurso().getId())
                .codigoCurso(silaboBase.getCurso().getCodigo())
                .version(silaboBase.getVersion())
                .competencias(silaboBase.getCompetencias())
                .metodologia(silaboBase.getMetodologia())
                .evaluacion(silaboBase.getEvaluacion())
                .bibliografia(silaboBase.getBibliografia())
                .estado(silaboBase.getEstado())
                .idCompetenciaEspecifica(silaboBase.getIdCompetenciaEspecifica())
                .idCompetenciaGeneral(silaboBase.getIdCompetenciaGeneral())
                .resultadoAprendizaje(silaboBase.getResultadoAprendizaje())
                .productoAcademico(silaboBase.getProductoAcademico())
                .descripcionProducto(silaboBase.getDescripcionProducto())
                .recursos(silaboBase.getRecursos())
                .referenciasBasicas(silaboBase.getReferenciasBasicas())
                .referenciasComplementarias(silaboBase.getReferenciasComplementarias())
                .enlacesInternet(silaboBase.getEnlacesInternet())
                .notaMinimaAprobatoria(silaboBase.getNotaMinimaAprobatoria())
                .build();
    }
}
