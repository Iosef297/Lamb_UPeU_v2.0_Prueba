package pe.edu.upeu.lamb.curriculo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "planes_estudio")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanEstudio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_programa", nullable = false)
    private Long idPrograma;

    @Column(name = "version", nullable = false, length = 20)
    private String version;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoPlan estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modalidad")
    private Modalidad modalidad;

    // Nota minima para aprobar los cursos del plan (LAMB: plan_programa.nota_aprobatoria)
    @Column(name = "nota_aprobatoria", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal notaAprobatoria = new BigDecimal("13");

    @Column(name = "fecha_registro", nullable = false)
    private Instant fechaRegistro;

    @Column(name = "fecha_publicacion")
    private Instant fechaPublicacion;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ciclo ASC, id ASC")
    @Builder.Default
    private List<PlanCurso> cursos = new ArrayList<>();
}
