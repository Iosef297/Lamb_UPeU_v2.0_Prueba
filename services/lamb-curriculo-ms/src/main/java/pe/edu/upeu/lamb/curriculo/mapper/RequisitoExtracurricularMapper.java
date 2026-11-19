package pe.edu.upeu.lamb.curriculo.mapper;

import pe.edu.upeu.lamb.curriculo.dto.RequisitoExtracurricularRequest;
import pe.edu.upeu.lamb.curriculo.dto.RequisitoExtracurricularResponse;
import pe.edu.upeu.lamb.curriculo.entity.RequisitoExtracurricular;
import org.springframework.stereotype.Component;

@Component
public class RequisitoExtracurricularMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public RequisitoExtracurricular toEntity(RequisitoExtracurricularRequest request) {
        return RequisitoExtracurricular.builder()
                .tipo(request.getTipo())
                .horasExigidas(request.getHorasExigidas())
                .build();
    }

    public RequisitoExtracurricularResponse toResponse(RequisitoExtracurricular requisitoExtracurricular) {
        return RequisitoExtracurricularResponse.builder()
                .id(requisitoExtracurricular.getId())
                .idPlan(requisitoExtracurricular.getPlan().getId())
                .versionPlan(requisitoExtracurricular.getPlan().getVersion())
                .tipo(requisitoExtracurricular.getTipo())
                .horasExigidas(requisitoExtracurricular.getHorasExigidas())
                .build();
    }
}
