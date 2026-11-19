package pe.edu.upeu.lamb.evaluacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

// CRUD 3 · Escala de calificacion (vigesimal 0-20, nota minima aprobatoria y regla de redondeo)
@Entity
@Table(name = "escalas_calificacion")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaCalificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "nota_minima", nullable = false, precision = 4, scale = 2)
    private BigDecimal notaMinima;

    @Column(name = "nota_maxima", nullable = false, precision = 4, scale = 2)
    private BigDecimal notaMaxima;

    @Column(name = "nota_aprobatoria", nullable = false, precision = 4, scale = 2)
    private BigDecimal notaAprobatoria;

    @Column(name = "decimales", nullable = false)
    private Integer decimales;

    @Enumerated(EnumType.STRING)
    @Column(name = "redondeo", nullable = false, length = 30)
    private TipoRedondeo redondeo;

    @Column(name = "vigente", nullable = false)
    private Boolean vigente;

    // Modo competencia: si EP < umbral la nota final es EP
    @Column(name = "umbral_producto", nullable = false, precision = 4, scale = 2)
    private BigDecimal umbralProducto;

    // Pesos ES/EP/ECG cuando el grupo no programo evidencias con peso
    @Column(name = "peso_sesiones", nullable = false, precision = 5, scale = 2)
    private BigDecimal pesoSesiones;

    @Column(name = "peso_producto", nullable = false, precision = 5, scale = 2)
    private BigDecimal pesoProducto;

    @Column(name = "peso_competencia_generica", nullable = false, precision = 5, scale = 2)
    private BigDecimal pesoCompetenciaGenerica;
}
