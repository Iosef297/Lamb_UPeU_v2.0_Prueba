package pe.edu.upeu.lamb.curriculo.dto;

import pe.edu.upeu.lamb.curriculo.entity.EstadoPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanEstudioResponse {
    private Long id;
    private Long idPrograma;
    private String version;
    private String nombre;
    private Long idModalidad;
    private EstadoPlan estado;
    private Instant fechaRegistro;
    private Instant fechaPublicacion;
    private BigDecimal notaAprobatoria;
    // Totales del plan como en el LAMB (plan_programa): cursos, creditos y horas HT, HP, HNP, TH
    private Integer numeroCursos;
    private Integer totalCreditos;
    private Integer totalHorasTeoria;
    private Integer totalHorasPractica;
    private Integer totalHorasNoPresenciales;
    private Integer totalHoras;
    private List<PlanCursoResponse> cursos;
}
