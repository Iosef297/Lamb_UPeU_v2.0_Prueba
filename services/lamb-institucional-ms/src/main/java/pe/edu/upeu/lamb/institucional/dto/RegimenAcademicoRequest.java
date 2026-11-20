package pe.edu.upeu.lamb.institucional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RegimenAcademicoRequest {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    private Integer anio;

    @Size(max = 255)
    private String descripcion;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private Integer periodosPorAnio;

    private String estado;

    private Long idTipoPeriodo;
}
