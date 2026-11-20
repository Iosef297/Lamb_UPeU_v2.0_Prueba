package pe.edu.upeu.lamb.planificacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Datos que Institucional envia para crear/actualizar su periodo operativo "espejo"
 * (idempotente por codigo) cuando se generan periodos desde un regimen academico.
 */
@Getter
@Setter
public class SyncPeriodoRequest {

    @NotBlank
    private String codigo;

    @NotBlank
    private String nombre;

    @NotBlank
    private String codigoTipoPeriodo;

    @NotBlank
    private String nombreTipoPeriodo;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;

    @NotBlank
    private String estado;
}
