package pe.edu.upeu.lamb.curriculo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrupoElectivoResponse {
    private Long id;
    private Long idPlan;
    private String versionPlan;
    private String nombre;
    private Integer cantidadElegir;
    // Cursos del catalogo (bolsa de opciones)
    private List<Long> idCursosCatalogo;
    // Cursos del plan (vacio mientras el grupo no esta en la malla)
    private List<Long> idPlanCursos;
    private Boolean enMalla;
}
