package pe.edu.upeu.lamb.planificacion.dto;

import lombok.*;

import java.time.LocalDateTime;

/** Una clase real del horario (fecha y hora), como schedule-detail del LAMB. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcurrenciaClaseResponse {
    private LocalDateTime fechaHoraInicio;
    private LocalDateTime fechaHoraFin;
    private Long idGrupo;
    private String codigoGrupo;
    private String nombreCurso;
    private Long idHorario;
    private Long idAsignacionDocente;
    private String etiquetaTipo;
    private String codigoAmbiente;
    private Long idAmbiente;
    private Long idDocente;
    private String nombreModulo;
    // Rango real del bloque (modulo o periodo)
    private java.time.LocalDate moduloInicio;
    private java.time.LocalDate moduloFin;
    private pe.edu.upeu.lamb.planificacion.entity.Turno turno;
}
