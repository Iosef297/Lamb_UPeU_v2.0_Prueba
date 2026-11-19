package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

/** Franja pedagogica fija del LAMB (17 por dia, ~50 min + cambio): el horario se arma marcando franjas. */
@Entity
@Table(name = "franjas_horarias")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FranjaHoraria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "turno", nullable = false, length = 10)
    private Turno turno;
}
