package pe.edu.upeu.lamb.curriculo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Cambia ciclo, tipo o area de un curso del plan sin quitarlo (conserva sus prerrequisitos). */
@Getter
@Setter
public class PlanCursoActualizarRequest {

    @NotNull
    @Min(1)
    @Max(14)
    private Integer ciclo;

    @NotNull
    private Long idTipoCurso;

    private Long idAreaCurricular;
}
