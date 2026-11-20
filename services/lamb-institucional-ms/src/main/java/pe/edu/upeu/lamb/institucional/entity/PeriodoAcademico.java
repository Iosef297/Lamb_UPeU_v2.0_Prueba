package pe.edu.upeu.lamb.institucional.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Periodo academico concreto (p. ej. 2026-I), asociado a un anio academico
 * y a un tipo de periodo.
 */
@Entity
@Table(name = "periodos_academicos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodoAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "id_anio_academico", nullable = false)
    private Long idAnioAcademico;

    @Column(name = "id_tipo_periodo", nullable = false)
    private Long idTipoPeriodo;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    /** Periodo padre (p.ej. 2026-I) cuando este registro es un subperiodo/modulo. */
    @Column(name = "id_periodo_padre")
    private Long idPeriodoPadre;

    /** Regimen academico que genero este periodo automaticamente (si aplica). */
    @Column(name = "id_regimen_academico")
    private Long idRegimenAcademico;
}
