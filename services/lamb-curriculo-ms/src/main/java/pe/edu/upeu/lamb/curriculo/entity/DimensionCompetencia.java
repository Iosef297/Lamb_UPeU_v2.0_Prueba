package pe.edu.upeu.lamb.curriculo.entity;

import jakarta.persistence.*;
import lombok.*;

/** Dimension numerada de una competencia (general o especifica), como aparece en el silabo del LAMB. */
@Entity
@Table(name = "dimensiones_competencia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimensionCompetencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // GENERAL o ESPECIFICA
    @Column(name = "tipo_competencia", nullable = false, length = 20)
    private String tipoCompetencia;

    @Column(name = "id_competencia", nullable = false)
    private Long idCompetencia;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "descripcion", nullable = false, length = 500)
    private String descripcion;
}
