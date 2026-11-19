package pe.edu.upeu.lamb.curriculo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Nueva version de un plan: se copian cursos y prerrequisitos a un BORRADOR. */
@Getter
@Setter
public class ClonarPlanRequest {

    @NotBlank
    @Size(max = 20)
    @jakarta.validation.constraints.Pattern(regexp = "^\\d{4}-1$",
            message = "La versión del plan es el año y semestre de inicio, siempre el primero: AAAA-1 (p. ej. 2028-1)")
    private String version;

    @NotBlank
    @Size(max = 150)
    private String nombre;
}
