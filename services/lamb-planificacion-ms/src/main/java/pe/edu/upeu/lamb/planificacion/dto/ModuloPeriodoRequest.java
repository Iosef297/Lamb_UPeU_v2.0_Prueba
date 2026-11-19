package pe.edu.upeu.lamb.planificacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ModuloPeriodoRequest {

    @NotNull
    private Long idPeriodo;

    @NotBlank
    @Size(max = 100)
    private String nombre;

    // Codigo corto del modulo, p. ej. R (Regular) o M1 (Modular 1)
    @NotBlank
    @Size(max = 5)
    private String codigo;

    @NotNull
    private pe.edu.upeu.lamb.planificacion.entity.FormatoModulo formato;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;
}
