package pe.edu.upeu.lamb.planificacion.dto;

import pe.edu.upeu.lamb.planificacion.entity.DiaSemana;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

// Una fila del horario del estudiante (vista calculada, sin tabla propia)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorarioEstudianteResponse {
    private DiaSemana diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Long idGrupo;
    private String codigoGrupo;
    private String codigoCurso;
    private String nombreCurso;
    private String codigoAmbiente;
    private Long idHorario;
    private String etiquetaTipo;
    private String rolDocente;
    private java.time.LocalDate fechaInicio;
    private java.time.LocalDate fechaFin;
    // Se cruza con otro bloque de los grupos consultados (mismo dia, horas y fechas que se pisan)
    private boolean cruce;
}
