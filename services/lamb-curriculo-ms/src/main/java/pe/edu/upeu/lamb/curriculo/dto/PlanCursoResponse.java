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
public class PlanCursoResponse {
    private Long id;
    private Long idCursoCatalogo;
    private String codigoCurso;
    private String nombreCurso;
    private Integer ciclo;
    private Integer creditos;
    // Columnas del plan en el LAMB: CR, HT, HP, TH (+ HNP)
    private Integer horasTeoria;
    private Integer horasPractica;
    private Integer horasNoPresenciales;
    private Integer horasTotales;
    private String tipo;
    private String areaCurricular;
    private List<String> prerrequisitos;
}
