package pe.edu.upeu.lamb.planificacion.dto;

import pe.edu.upeu.lamb.planificacion.entity.DiaSemana;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorarioGrupoResponse {
    private Long id;
    private Long idGrupo;
    private String codigoGrupo;
    private Long idAmbiente;
    private String codigoAmbiente;
    private DiaSemana diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean activo;
    private java.time.LocalDate fechaInicio;
    private java.time.LocalDate fechaFin;
    private String tipoHorario;
    private Integer numeroSubgrupo;
    private String codigoTipo;
    private String etiquetaTipo;
    private Long idAsignacionDocente;
    private Long idDocente;
    private String rolDocente;
    private Long idModulo;
    private String nombreModulo;
    // Calculado por la hora de inicio (MANANA, TARDE, NOCHE)
    private pe.edu.upeu.lamb.planificacion.entity.Turno turno;
}
