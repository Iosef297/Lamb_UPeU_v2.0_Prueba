package pe.edu.upeu.ingresospagos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.upeu.ingresospagos.dto.LogTransaccionPasarelaRequest;
import pe.edu.upeu.ingresospagos.dto.LogTransaccionPasarelaResponse;
import pe.edu.upeu.ingresospagos.entity.LogTransaccionPasarela;

@Mapper(componentModel = "spring")
public interface LogTransaccionPasarelaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idPago", source = "pagoId")
    @Mapping(target = "fecha", ignore = true)
    LogTransaccionPasarela toEntity(LogTransaccionPasarelaRequest request);

    LogTransaccionPasarelaResponse toResponse(LogTransaccionPasarela logTransaccionPasarela);
}
