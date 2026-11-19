package pe.edu.upeu.lamb.evaluacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

// CRUD 7 · Evaluacion programada (fecha de examen)
@Entity
@Table(name = "evaluaciones_programadas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionProgramada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Grupo: se jala de lamb-planificacion-ms (CRUD 7 de planificacion, GET /api/v1/grupos/{id})
    @Column(name = "id_grupo", nullable = false)
    private Long idGrupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_componente", nullable = false)
    private ComponenteEvaluacion componente;

    // ECG puede no tener fecha
    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "descripcion", nullable = true, length = 255)
    private String descripcion;

    // Unidad del silabo (UN1, UN2...) y producto academico evaluado
    @Column(name = "unidad", length = 10)
    private String unidad;

    @Column(name = "producto", length = 150)
    private String producto;

    @Column(name = "nro_sesiones")
    private Integer nroSesiones;

    @Column(name = "orden")
    private Integer orden;

    // Peso de la evidencia en la nota final (la suma del grupo no pasa de 100)
    @Column(name = "peso", precision = 5, scale = 2)
    private java.math.BigDecimal peso;
}
