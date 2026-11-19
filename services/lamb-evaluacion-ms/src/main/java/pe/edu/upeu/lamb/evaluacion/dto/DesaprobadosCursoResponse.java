package pe.edu.upeu.lamb.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

// Vista: estudiantes que desaprobaron un curso (o sus equivalentes) y todavia no lo aprobaron.
// Sirve para decidir si se abre un curso intensivo de vacaciones: cuenta personas de cualquier carrera.
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesaprobadosCursoResponse {

    // Codigos de curso consultados (el curso y sus equivalentes)
    private List<String> codigos;
    private int desaprobados;
    private List<Estudiante> estudiantes;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Estudiante {
        private Long idPersona;
        // Ultimo intento
        private String codigoCurso;
        private String periodo;
        private BigDecimal notaFinal;
        // Veces que lo llevo
        private int intentos;
    }
}
