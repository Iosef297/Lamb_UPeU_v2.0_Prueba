package pe.edu.upeu.lamb.planificacion.dto;

import pe.edu.upeu.lamb.planificacion.entity.DiaSemana;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class HorarioGrupoRequest {

    @NotNull
    private Long idGrupo;

    // Opcional: sin ambiente = "Por confirmar"
    private Long idAmbiente;

    @NotNull
    private DiaSemana diaSemana;

    @NotNull
    private LocalTime horaInicio;

    @NotNull
    private LocalTime horaFin;

    // Rango de fechas en que rige el horario (modulo del LAMB real) y tipo de sesion; opcionales
    private java.time.LocalDate fechaInicio;

    private java.time.LocalDate fechaFin;

    // Tipo del LAMB: TEORIA / PRACTICA + numero de subgrupo (T, T1, P1)
    @jakarta.validation.constraints.Pattern(regexp = "TEORIA|PRACTICA", message = "debe ser TEORIA o PRACTICA")
    private String tipoHorario;

    @jakarta.validation.constraints.Min(1)
    @jakarta.validation.constraints.Max(20)
    private Integer numeroSubgrupo;

    // Asignacion docente del mismo grupo que dicta el bloque
    private Long idAsignacionDocente;

    // Modulo del periodo: si no se envian fechas, el bloque toma las del modulo
    private Long idModulo;
}
