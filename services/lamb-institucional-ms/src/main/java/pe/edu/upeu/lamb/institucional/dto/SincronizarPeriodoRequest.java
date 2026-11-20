package pe.edu.upeu.lamb.institucional.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Datos que Institucional envia a Planificacion para crear/actualizar su propio
 * periodo operativo "espejo" cuando se generan periodos desde un regimen academico.
 */
@Getter
@Setter
@Builder
public class SincronizarPeriodoRequest {

    private String codigo;
    private String nombre;
    private String codigoTipoPeriodo;
    private String nombreTipoPeriodo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
}
