package pe.edu.upeu.lamb.planificacion.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CursoIntensivoRequest {

    // Periodo regular anterior a las vacaciones
    @NotNull
    private Long idPeriodo;

    @NotNull
    private Long idCurso;

    // Minimo de inscritos (que desaprobaron el curso) para abrirlo
    @NotNull
    @Min(1)
    private Integer cupoMinimo;

    @NotNull
    @Min(1)
    private Integer cupoMaximo;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;
}
