package pe.edu.upeu.ingresospagos.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PagoConceptoRequest {

    @NotBlank
    @Size(max = 36)
    private String idEstudiante;

    @NotNull
    private Long conceptoPagoId;

    @NotNull
    private Long metodoPagoId;

    private Long sesionCajaId;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal monto;

    @Size(max = 255)
    private String observacion;
}
