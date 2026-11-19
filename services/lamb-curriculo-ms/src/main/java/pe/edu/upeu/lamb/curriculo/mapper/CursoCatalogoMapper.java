package pe.edu.upeu.lamb.curriculo.mapper;

import pe.edu.upeu.lamb.curriculo.dto.CursoCatalogoRequest;
import pe.edu.upeu.lamb.curriculo.dto.CursoCatalogoResponse;
import pe.edu.upeu.lamb.curriculo.entity.CursoCatalogo;
import org.springframework.stereotype.Component;

@Component
public class CursoCatalogoMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public CursoCatalogo toEntity(CursoCatalogoRequest request) {
        return CursoCatalogo.builder()
                .codigo(request.getCodigo().trim())
                .nombre(request.getNombre().trim())
                .creditos(request.getCreditos())
                .build();
    }

    public CursoCatalogoResponse toResponse(CursoCatalogo cursoCatalogo) {
        return CursoCatalogoResponse.builder()
                .id(cursoCatalogo.getId())
                .codigo(cursoCatalogo.getCodigo())
                .nombre(cursoCatalogo.getNombre())
                .creditos(cursoCatalogo.getCreditos())
                .horasTeoria(cursoCatalogo.getHorasTeoria())
                .horasPractica(cursoCatalogo.getHorasPractica())
                .horasNoPresenciales(cursoCatalogo.getHorasNoPresenciales())
                .horasAprendizajeAutonomo(cursoCatalogo.getHorasAprendizajeAutonomo())
                .creditosTeoria(cursoCatalogo.getCreditosTeoria())
                .creditosPractica(cursoCatalogo.getCreditosPractica())
                .horasTotales(cursoCatalogo.getHorasTotales())
                .idDepartamento(cursoCatalogo.getIdDepartamento())
                .idPrograma(cursoCatalogo.getIdPrograma())
                .idModalidad(cursoCatalogo.getModalidad() != null ? cursoCatalogo.getModalidad().getId() : null)
                .codigoModalidad(cursoCatalogo.getModalidad() != null ? cursoCatalogo.getModalidad().getCodigo() : null)
                .build();
    }
}
