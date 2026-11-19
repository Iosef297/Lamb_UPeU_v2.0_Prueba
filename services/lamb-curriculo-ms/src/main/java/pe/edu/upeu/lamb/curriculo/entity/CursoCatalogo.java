package pe.edu.upeu.lamb.curriculo.entity;

import jakarta.persistence.*;
import lombok.*;

// CRUD 12 · Catalogo de cursos: el curso se define una sola vez aqui; el plan lo incluye como PlanCurso
@Entity
@Table(name = "cursos_catalogo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursoCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "creditos", nullable = false)
    private Integer creditos;

    // Horas semanales del curso como en el LAMB (curso_detalle): HT, HP, HNP y HAA.
    // TH (total presencial) = HT + HP. Un curso puede tener HT 0 (solo practica).
    @Column(name = "horas_teoria", nullable = false)
    private Integer horasTeoria;

    @Column(name = "horas_practica", nullable = false)
    private Integer horasPractica;

    @Column(name = "horas_no_presenciales", nullable = false)
    private Integer horasNoPresenciales;

    @Column(name = "horas_aprendizaje_autonomo", nullable = false)
    private Integer horasAprendizajeAutonomo;

    // Creditos de teoria y de practica (CT, CP): opcionales, si se registran suman los creditos
    @Column(name = "creditos_teoria", nullable = false)
    private Integer creditosTeoria;

    @Column(name = "creditos_practica", nullable = false)
    private Integer creditosPractica;

    public int getHorasTotales() {
        return horasTeoria + horasPractica;
    }

    // Programa (carrera) donde se creo el curso, de lamb-institucional-ms (solo el id). Null en los cursos compartidos
    @Column(name = "id_programa")
    private Long idPrograma;

    // Departamento academico de lamb-institucional-ms (solo el id, sin FK entre microservicios)
    @Column(name = "id_departamento")
    private Long idDepartamento;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "id_modalidad", nullable = true)
    private Modalidad modalidad;
}
