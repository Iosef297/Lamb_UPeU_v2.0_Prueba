package pe.edu.upeu.lamb.curriculo.entity;

import jakarta.persistence.*;
import lombok.*;

// CRUD 15 · Silabo base del curso (planificacion lo jala para el silabo de cada grupo)
@Entity
@Table(name = "silabos_base")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SilaboBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_curso", nullable = false)
    private CursoCatalogo curso;

    @Column(name = "version", nullable = false, length = 20)
    private String version;

    @Column(name = "competencias", nullable = true, length = 1000)
    private String competencias;

    @Column(name = "metodologia", nullable = true, length = 1000)
    private String metodologia;

    @Column(name = "evaluacion", nullable = true, length = 1000)
    private String evaluacion;

    @Column(name = "bibliografia", nullable = true, length = 2000)
    private String bibliografia;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoSilabo estado;

    // Competencia del perfil de egreso que desarrolla el curso
    @Column(name = "id_competencia_especifica")
    private Long idCompetenciaEspecifica;

    @Column(name = "id_competencia_general")
    private Long idCompetenciaGeneral;

    // Resultado de aprendizaje de la asignatura y producto academico final
    @Column(name = "resultado_aprendizaje", length = 1000)
    private String resultadoAprendizaje;

    @Column(name = "producto_academico", length = 255)
    private String productoAcademico;

    @Column(name = "descripcion_producto", length = 1000)
    private String descripcionProducto;

    // Recursos, medios y materiales
    @Column(name = "recursos", length = 2000)
    private String recursos;

    // Referencias por tipo: basica, complementaria y enlaces de internet
    @Column(name = "referencias_basicas", length = 2000)
    private String referenciasBasicas;

    @Column(name = "referencias_complementarias", length = 2000)
    private String referenciasComplementarias;

    @Column(name = "enlaces_internet", length = 2000)
    private String enlacesInternet;

    // Nota minima aprobatoria que declara el silabo (UPeU: 13)
    @Column(name = "nota_minima_aprobatoria", precision = 5, scale = 2)
    private java.math.BigDecimal notaMinimaAprobatoria;
}
