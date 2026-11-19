package pe.edu.upeu.lamb.planificacion.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuloPeriodoResponse {
    private Long id;
    private Long idPeriodo;
    private String codigoPeriodo;
    private String nombre;
    private String codigo;
    private pe.edu.upeu.lamb.planificacion.entity.FormatoModulo formato;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
