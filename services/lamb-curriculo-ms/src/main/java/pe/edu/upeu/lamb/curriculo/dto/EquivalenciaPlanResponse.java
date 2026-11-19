package pe.edu.upeu.lamb.curriculo.dto;

import pe.edu.upeu.lamb.curriculo.entity.TipoEquivalencia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquivalenciaPlanResponse {
    private Long id;
    private Long idPlanCursoOrigen;
    private Long idPlanCursoDestino;
    private TipoEquivalencia tipo;
    private String observacion;
    // Datos del curso destino para la ventana "Equivalencias" del plan (como en el LAMB:
    // curso, unidad academica, CR, HT, HP, HNP, TH). idDepartamentoDestino es de lamb-institucional-ms.
    private String codigoCursoDestino;
    private String nombreCursoDestino;
    private Long idPlanDestino;
    private String versionPlanDestino;
    // Carrera del curso equivalente: id de programa (lamb-institucional-ms), nombre del plan, ciclo y tipo
    private Long idProgramaDestino;
    private String nombrePlanDestino;
    private Integer cicloDestino;
    private String tipoCursoDestino;
    private Long idDepartamentoDestino;
    private Integer creditosDestino;
    private Integer horasTeoriaDestino;
    private Integer horasPracticaDestino;
    private Integer horasNoPresencialesDestino;
    private Integer horasTotalesDestino;
}
