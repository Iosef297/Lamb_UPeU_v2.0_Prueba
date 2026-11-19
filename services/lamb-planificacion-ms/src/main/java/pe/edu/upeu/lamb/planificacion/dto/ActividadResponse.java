package pe.edu.upeu.lamb.planificacion.dto;

import lombok.*;

import java.time.LocalDate;

/** Una actividad del calendario (como student/activities del LAMB). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActividadResponse {
    // HITO, NO_LECTIVO, EVALUACION, PAGO
    private String origen;
    private Long idOrigen;
    // Tipo legible: "Inicio de clases", "Evaluacion", "Fecha de pago", "Feriado"...
    private String tipo;
    private String titulo;
    // Participante: ACADEMICO, FINANCIERO...
    private String area;
    private String descripcion;
    // Alcance: "Sede 1", "Programa 10", "IS101 grupo A"
    private String alcance;
    private String estado;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
