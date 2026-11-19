package pe.edu.upeu.lamb.planificacion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SesionClaseRequest {

    @NotNull
    private Long idSilabo;

    @NotNull
    @Min(1)
    @Max(64)
    private Integer numero;

    @NotNull
    @Min(1)
    @Max(20)
    private Integer semana;

    @NotBlank
    @Size(max = 255)
    private String tema;

    private Long idUnidadAprendizaje;

    @Size(max = 1000)
    private String actividades;

    @jakarta.validation.constraints.Size(max = 20)
    @jakarta.validation.constraints.Pattern(regexp = "TEORIA|PRACTICA", message = "debe ser TEORIA o PRACTICA")
    private String tipoSesion;

    private java.time.LocalDate fecha;

    @jakarta.validation.constraints.Min(0)
    private Integer horasTeoria;

    @jakarta.validation.constraints.Min(0)
    private Integer horasPractica;

    @jakarta.validation.constraints.Min(0)
    private Integer horasAutonomas;

    @jakarta.validation.constraints.Size(max = 1000)
    private String actividadPractica;

    @jakarta.validation.constraints.Size(max = 1000)
    private String actividadAutonoma;

    @jakarta.validation.constraints.Size(max = 500)
    private String evidencia;

    @jakarta.validation.constraints.Size(max = 1000)
    private String instrumentos;

    @jakarta.validation.constraints.Size(max = 2000)
    private String actividadSincrona;

    @jakarta.validation.constraints.Size(max = 2000)
    private String actividadAsincrona;

    @jakarta.validation.constraints.Size(max = 500)
    private String adjuntoUrl;
}
