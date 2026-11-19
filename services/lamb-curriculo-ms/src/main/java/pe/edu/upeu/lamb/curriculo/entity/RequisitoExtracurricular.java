package pe.edu.upeu.lamb.curriculo.entity;

import jakarta.persistence.*;
import lombok.*;

// CRUD 37 · Requisito de actividades extracurriculares (horas exigidas por tipo de actividad)
@Entity
@Table(name = "requisitos_extracurriculares")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequisitoExtracurricular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plan", nullable = false)
    private PlanEstudio plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoActividadFormacion tipo;

    @Column(name = "horas_exigidas", nullable = false)
    private Integer horasExigidas;
}
