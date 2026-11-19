package pe.edu.upeu.lamb.planificacion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Solo la cabecera: los horarios y docentes se editan en sus propios recursos
@Getter
@Setter
public class GrupoActualizarRequest {

    @NotBlank
    @Size(max = 20)
    private String codigo;

    @NotNull
    @Min(1)
    private Integer cupoMaximo;

    // Opcional: si no llega, se conserva el ciclo actual
    @Min(1)
    @Max(14)
    private Integer ciclo;

    // Version que el cliente leyo; si otro la cambio antes, responde 409
    @NotNull
    private Long version;
}
