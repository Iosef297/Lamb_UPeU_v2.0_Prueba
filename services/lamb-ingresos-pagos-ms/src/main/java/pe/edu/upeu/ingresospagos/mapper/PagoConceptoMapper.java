package pe.edu.upeu.ingresospagos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.upeu.ingresospagos.dto.PagoConceptoRequest;
import pe.edu.upeu.ingresospagos.dto.PagoConceptoResponse;
import pe.edu.upeu.ingresospagos.entity.PagoConcepto;

@Mapper(componentModel = "spring", uses = SesionCajaMapper.class)
public interface PagoConceptoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idConceptoPago", source = "conceptoPagoId")
    @Mapping(target = "idMetodoPago", source = "metodoPagoId")
    @Mapping(target = "sesionCaja", ignore = true)
    @Mapping(target = "fechaPago", ignore = true)
    PagoConcepto toEntity(PagoConceptoRequest request);

    PagoConceptoResponse toResponse(PagoConcepto pagoConcepto);
}
