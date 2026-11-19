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
public class CursoCatalogoRequest {

    @NotBlank
    @Size(max = 20)
    private String codigo;

    @NotBlank
    @Size(max = 150)
    private String nombre;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer creditos;

    // Horas semanales como en el LAMB: HT, HP, HNP y HAA (HT + HP >= 1; HT puede ser 0)
    @NotNull
    @Min(0)
    @Max(20)
    private Integer horasTeoria;

    @NotNull
    @Min(0)
    @Max(20)
    private Integer horasPractica;

    @NotNull
    @Min(0)
    @Max(40)
    private Integer horasNoPresenciales;

    @NotNull
    @Min(0)
    @Max(40)
    private Integer horasAprendizajeAutonomo;

    // Creditos de teoria y de practica (CT, CP): opcionales; si se envian deben sumar los creditos
    @Min(0)
    @Max(10)
    private Integer creditosTeoria;

    @Min(0)
    @Max(10)
    private Integer creditosPractica;

    private Long idDepartamento;

    // Programa donde se crea el curso (opcional)
    private Long idPrograma;

    private Long idModalidad;
}
