package pe.edu.upeu.lamb.evaluacion.dto;

import pe.edu.upeu.lamb.evaluacion.entity.TipoRedondeo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class EscalaCalificacionRequest {

    @NotBlank
    @Size(max = 20)
    private String codigo;

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal notaMinima;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal notaMaxima;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal notaAprobatoria;

    @NotNull
    @Min(0)
    @Max(2)
    private Integer decimales;

    @NotNull
    private TipoRedondeo redondeo;

    @NotNull
    private Boolean vigente;

    // Modo competencia (opcionales: si no vienen se usan 12.5 y 20/70/10)
    @DecimalMin("0.0")
    private BigDecimal umbralProducto;

    @DecimalMin("0.0")
    private BigDecimal pesoSesiones;

    @DecimalMin("0.0")
    private BigDecimal pesoProducto;

    @DecimalMin("0.0")
    private BigDecimal pesoCompetenciaGenerica;
}
