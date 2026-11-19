package pe.edu.upeu.lamb.curriculo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnidadAprendizajeRequest {

    @NotNull
    private Long idSilabo;

    @NotNull
    @Min(1)
    @Max(8)
    private Integer numero;

    @NotBlank
    @Size(max = 200)
    private String nombre;

    @NotNull
    @Min(1)
    @Max(20)
    private Integer semanaInicio;

    @NotNull
    @Min(1)
    @Max(20)
    private Integer semanaFin;

    @Size(max = 2000)
    private String contenidos;

    @jakarta.validation.constraints.Size(max = 1000)
    private String resultadoAprendizaje;

    @jakarta.validation.constraints.Size(max = 255)
    private String producto;

    @jakarta.validation.constraints.Size(max = 1000)
    private String descripcionProducto;

    @jakarta.validation.constraints.Size(max = 2000)
    private String criteriosEvaluacion;
}
