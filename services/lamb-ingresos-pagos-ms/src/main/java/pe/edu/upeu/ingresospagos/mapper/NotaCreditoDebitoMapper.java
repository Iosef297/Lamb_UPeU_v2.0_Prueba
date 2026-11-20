package pe.edu.upeu.ingresospagos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.upeu.ingresospagos.dto.NotaCreditoDebitoRequest;
import pe.edu.upeu.ingresospagos.dto.NotaCreditoDebitoResponse;
import pe.edu.upeu.ingresospagos.entity.NotaCreditoDebito;

@Mapper(componentModel = "spring")
public interface NotaCreditoDebitoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idPago", source = "pagoId")
    @Mapping(target = "fechaEmision", ignore = true)
    NotaCreditoDebito toEntity(NotaCreditoDebitoRequest request);

    NotaCreditoDebitoResponse toResponse(NotaCreditoDebito notaCreditoDebito);
}
