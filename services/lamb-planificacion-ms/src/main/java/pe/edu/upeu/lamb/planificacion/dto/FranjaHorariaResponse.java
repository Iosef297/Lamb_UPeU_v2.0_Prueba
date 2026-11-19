package pe.edu.upeu.lamb.planificacion.dto;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FranjaHorariaResponse {
    private Long id;
    private Integer orden;
    // "F2"
    private String codigo;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private pe.edu.upeu.lamb.planificacion.entity.Turno turno;
}
