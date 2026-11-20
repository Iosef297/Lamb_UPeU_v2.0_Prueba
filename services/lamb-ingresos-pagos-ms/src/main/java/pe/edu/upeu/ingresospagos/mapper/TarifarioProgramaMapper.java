package pe.edu.upeu.ingresospagos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.upeu.ingresospagos.dto.TarifarioProgramaRequest;
import pe.edu.upeu.ingresospagos.dto.TarifarioProgramaResponse;
import pe.edu.upeu.ingresospagos.entity.TarifarioPrograma;

@Mapper(componentModel = "spring")
public interface TarifarioProgramaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idConceptoPago", source = "conceptoPagoId")
    TarifarioPrograma toEntity(TarifarioProgramaRequest request);

    TarifarioProgramaResponse toResponse(TarifarioPrograma tarifarioPrograma);
}
