package pe.edu.upeu.lamb.curriculo.entity;

import jakarta.persistence.*;
import lombok.*;

// CRUD 16 · Unidades de aprendizaje del silabo base
@Entity
@Table(name = "unidades_aprendizaje")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnidadAprendizaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_silabo", nullable = false)
    private SilaboBase silabo;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "semana_inicio", nullable = false)
    private Integer semanaInicio;

    @Column(name = "semana_fin", nullable = false)
    private Integer semanaFin;

    @Column(name = "contenidos", nullable = true, length = 2000)
    private String contenidos;

    // Resultado de aprendizaje de la unidad
    @Column(name = "resultado_aprendizaje", length = 1000)
    private String resultadoAprendizaje;

    // Producto de la unidad y como se evalua
    @Column(name = "producto", length = 255)
    private String producto;

    @Column(name = "descripcion_producto", length = 1000)
    private String descripcionProducto;

    @Column(name = "criterios_evaluacion", length = 2000)
    private String criteriosEvaluacion;
}
