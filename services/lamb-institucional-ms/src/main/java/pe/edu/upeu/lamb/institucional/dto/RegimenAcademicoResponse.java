package pe.edu.upeu.lamb.institucional.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegimenAcademicoResponse {
    private Long id;
    private String nombre;
    private Integer anio;
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer periodosPorAnio;
    private String estado;
    private Long idTipoPeriodo;
}
