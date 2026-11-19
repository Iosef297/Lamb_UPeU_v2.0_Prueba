package pe.edu.upeu.lamb.curriculo.dto;

import pe.edu.upeu.lamb.curriculo.entity.EstadoSilabo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SilaboBaseRequest {

    @NotNull
    private Long idCurso;

    @NotBlank
    @Size(max = 20)
    private String version;

    @Size(max = 1000)
    private String competencias;

    @Size(max = 1000)
    private String metodologia;

    @Size(max = 1000)
    private String evaluacion;

    @Size(max = 2000)
    private String bibliografia;

    @NotNull
    private EstadoSilabo estado;

    private Long idCompetenciaEspecifica;

    private Long idCompetenciaGeneral;

    @jakarta.validation.constraints.Size(max = 1000)
    private String resultadoAprendizaje;

    @jakarta.validation.constraints.Size(max = 255)
    private String productoAcademico;

    @jakarta.validation.constraints.Size(max = 1000)
    private String descripcionProducto;

    @jakarta.validation.constraints.Size(max = 2000)
    private String recursos;

    @jakarta.validation.constraints.Size(max = 2000)
    private String referenciasBasicas;

    @jakarta.validation.constraints.Size(max = 2000)
    private String referenciasComplementarias;

    @jakarta.validation.constraints.Size(max = 2000)
    private String enlacesInternet;

    @jakarta.validation.constraints.DecimalMin("0.0")
    @jakarta.validation.constraints.DecimalMax("20.0")
    private java.math.BigDecimal notaMinimaAprobatoria;
}
