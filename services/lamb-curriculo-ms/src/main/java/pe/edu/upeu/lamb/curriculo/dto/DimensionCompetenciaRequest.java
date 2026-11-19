package pe.edu.upeu.lamb.curriculo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DimensionCompetenciaRequest {

    @NotBlank
    @Pattern(regexp = "GENERAL|ESPECIFICA", message = "debe ser GENERAL o ESPECIFICA")
    private String tipoCompetencia;

    @NotNull
    private Long idCompetencia;

    @NotNull
    @Min(1)
    private Integer numero;

    @NotBlank
    @Size(max = 500)
    private String descripcion;
}
