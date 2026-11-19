package pe.edu.upeu.lamb.evaluacion.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EvaluacionProgramadaRequest {

    @NotNull
    private Long idGrupo;

    @NotNull
    private Long idComponente;

    // Opcional: la evaluacion de competencia generica (ECG) no tiene fecha
    private LocalDate fecha;

    @Size(max = 255)
    private String descripcion;

    @Size(max = 10)
    private String unidad;

    @Size(max = 150)
    private String producto;

    @Min(0)
    private Integer nroSesiones;

    @Min(1)
    private Integer orden;

    @DecimalMin(value = "0.01")
    @DecimalMax(value = "100.0")
    private java.math.BigDecimal peso;
}
