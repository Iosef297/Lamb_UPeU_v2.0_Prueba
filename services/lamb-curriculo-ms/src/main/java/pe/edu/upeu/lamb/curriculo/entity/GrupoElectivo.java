package pe.edu.upeu.lamb.curriculo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

// CRUD 21 · Grupo de electivos (elegir N de M cursos del plan)
@Entity
@Table(name = "grupos_electivos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrupoElectivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plan", nullable = false)
    private PlanEstudio plan;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "cantidad_elegir", nullable = false)
    private Integer cantidadElegir;

    // Bolsa de opciones: cursos del catalogo del grupo. Mientras el grupo no esta en la malla solo existe esto
    @ElementCollection
    @CollectionTable(name = "grupo_electivo_catalogo", joinColumns = @JoinColumn(name = "id_grupo_electivo"))
    @Column(name = "id_curso_catalogo", nullable = false)
    @Builder.Default
    private List<Long> idCursosCatalogo = new ArrayList<>();

    // Cursos del plan que forman el grupo (M); vacio = el grupo todavia no se ubico en la malla
    @ElementCollection
    @CollectionTable(name = "grupo_electivo_cursos", joinColumns = @JoinColumn(name = "id_grupo_electivo"))
    @Column(name = "id_plan_curso", nullable = false)
    @Builder.Default
    private List<Long> idPlanCursos = new ArrayList<>();
}
