package pe.edu.upeu.lamb.planificacion.dto;

import pe.edu.upeu.lamb.planificacion.entity.EstadoCursoIntensivo;
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
public class CursoIntensivoResponse {
    private Long id;
    private Long idPeriodo;
    private String codigoPeriodo;
    private Long idCurso;
    private String codigoCurso;
    private Integer cupoMinimo;
    private Integer cupoMaximo;
    private EstadoCursoIntensivo estado;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
