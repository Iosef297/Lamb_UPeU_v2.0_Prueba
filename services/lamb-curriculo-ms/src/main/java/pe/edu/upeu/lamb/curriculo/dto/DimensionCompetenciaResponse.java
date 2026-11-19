package pe.edu.upeu.lamb.curriculo.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimensionCompetenciaResponse {
    private Long id;
    private String tipoCompetencia;
    private Long idCompetencia;
    private String nombreCompetencia;
    private Integer numero;
    private String descripcion;
}
