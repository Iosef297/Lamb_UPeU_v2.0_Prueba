package pe.edu.upeu.ingresospagos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos_concepto")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagoConcepto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_estudiante", nullable = false, length = 36)
    private String idEstudiante;

    @Column(name = "id_concepto_pago", nullable = false)
    private Long idConceptoPago;

    @Column(name = "id_metodo_pago", nullable = false)
    private Long idMetodoPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sesion_caja")
    private SesionCaja sesionCaja;

    @Column(name = "monto", nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "observacion", length = 255)
    private String observacion;

    @Column(name = "fecha_pago", nullable = false)
    @Builder.Default
    private LocalDateTime fechaPago = LocalDateTime.now();
}
