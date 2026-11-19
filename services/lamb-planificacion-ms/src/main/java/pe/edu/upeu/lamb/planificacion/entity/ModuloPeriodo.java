package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Modulo del periodo ("Regular - Pregrado", "Modular 1 - Pregrado"): agrupa bloques de horario con sus fechas. */
@Entity
@Table(name = "modulos_periodo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuloPeriodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_periodo", nullable = false)
    private PeriodoAcademico periodo;

    // Codigo corto del modulo, p. ej. "R" (Regular - Pregrado) o "M1" (Modular 1)
    @Column(name = "codigo", nullable = false, length = 5)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "formato", nullable = false, length = 10)
    private FormatoModulo formato;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;
}
