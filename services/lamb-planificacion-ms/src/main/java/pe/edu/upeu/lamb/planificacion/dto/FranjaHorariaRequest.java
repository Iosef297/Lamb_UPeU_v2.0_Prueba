package pe.edu.upeu.lamb.planificacion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class FranjaHorariaRequest {

    @NotNull
    @Min(0)
    @Max(16)
    private Integer orden;

    @NotNull
    private LocalTime horaInicio;

    @NotNull
    private LocalTime horaFin;

    // Si no viene se calcula por la hora de inicio
    private pe.edu.upeu.lamb.planificacion.entity.Turno turno;
}
