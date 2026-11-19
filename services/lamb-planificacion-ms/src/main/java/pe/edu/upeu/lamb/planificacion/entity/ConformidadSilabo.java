package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Constancia de que el estudiante recibio el silabo del grupo ("Declaro que he recibido informacion
 * sobre los contenidos, los resultados de aprendizaje y la evaluacion"). Una por estudiante y grupo.
 */
@Entity
@Table(name = "conformidades_silabo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConformidadSilabo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_grupo", nullable = false)
    private Grupo grupo;

    // FUSION: estudiante = persona de lamb-personas-ms
    @Column(name = "id_persona", nullable = false)
    private Long idPersona;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;
}
