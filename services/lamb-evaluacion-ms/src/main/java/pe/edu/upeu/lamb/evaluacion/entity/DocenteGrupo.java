package pe.edu.upeu.lamb.evaluacion.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Copia local de un docente del grupo con sus permisos (dueno: lamb-planificacion-ms, llega por Kafka).
 */
@Entity
@Table(name = "docentes_grupo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocenteGrupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_grupo", nullable = false)
    private Long idGrupo;

    @Column(name = "id_docente", nullable = false)
    private Long idDocente;

    @Column(name = "rol", nullable = false, length = 30)
    private String rol;

    @Column(name = "gestiona_nota", nullable = false)
    private Boolean gestionaNota;

    @Column(name = "gestiona_asistencia", nullable = false)
    private Boolean gestionaAsistencia;
}
