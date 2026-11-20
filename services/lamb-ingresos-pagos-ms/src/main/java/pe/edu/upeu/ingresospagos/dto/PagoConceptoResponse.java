package pe.edu.upeu.ingresospagos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagoConceptoResponse {
    private Long id;
    private String idEstudiante;
    private Long idConceptoPago;
    private Long idMetodoPago;
    private SesionCajaResponse sesionCaja;
    private BigDecimal monto;
    private String observacion;
    private LocalDateTime fechaPago;
}
