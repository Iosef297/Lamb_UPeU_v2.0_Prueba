package pe.edu.upeu.lamb.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** "Resumen de evaluaciones (Modo competencia)" de un estudiante: ES, EP, ECG y nota final. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumenCompetenciasResponse {
    private Long idPersona;
    private BigDecimal es;
    private BigDecimal ep;
    // null si el curso no tiene evaluacion de competencia generica
    private BigDecimal ecg;
    private BigDecimal notaFinal;
    private boolean aprobado;
    private String formula;
}
