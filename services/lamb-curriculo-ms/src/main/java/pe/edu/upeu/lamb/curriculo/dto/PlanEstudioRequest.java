package pe.edu.upeu.lamb.curriculo.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PlanEstudioRequest {

    @NotNull
    private Long idPrograma;

    @NotBlank
    @Size(max = 20)
    @jakarta.validation.constraints.Pattern(regexp = "^\\d{4}-1$",
            message = "La versión del plan es el año y semestre de inicio, siempre el primero: AAAA-1 (p. ej. 2028-1)")
    private String version;

    @NotBlank
    @Size(max = 150)
    private String nombre;

    private Long idModalidad;

    // Opcional: si no se envia queda 13 (pregrado UPeU)
    @DecimalMin("0")
    @DecimalMax("20")
    private BigDecimal notaAprobatoria;
}
