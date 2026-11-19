package pe.edu.upeu.lamb.planificacion.dto;

import pe.edu.upeu.lamb.planificacion.entity.TipoHito;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class HitoCalendarioRequest {

    @NotNull
    private Long idCalendario;

    @NotNull
    private TipoHito tipo;

    @NotBlank
    @Size(max = 150)
    private String nombre;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;

    @Size(max = 500)
    private String descripcion;

    private pe.edu.upeu.lamb.planificacion.entity.AreaResponsable areaResponsable;

    private Long idPrograma;

    private pe.edu.upeu.lamb.planificacion.entity.EstadoHito estado;

    private Boolean visibleAlumno;
}
