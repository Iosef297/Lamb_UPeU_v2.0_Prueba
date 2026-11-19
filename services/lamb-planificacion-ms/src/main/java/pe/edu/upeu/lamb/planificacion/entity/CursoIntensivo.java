package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

// CRUD 11 · Curso intensivo de vacaciones: lo llevan los que desaprobaron el curso (de cualquier carrera).
// Pertenece al periodo regular anterior a las vacaciones (p. ej. el de enero va con 2027-2) y trae sus propias fechas.
@Entity
@Table(name = "cursos_intensivos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursoIntensivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo", nullable = false)
    private PeriodoAcademico periodo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    @Column(name = "cupo_minimo", nullable = false)
    private Integer cupoMinimo;

    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoCursoIntensivo estado;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;
}
