package pe.edu.upeu.lamb.institucional.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "regimenes_academicos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegimenAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "anio")
    private Integer anio;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "periodos_por_anio")
    private Integer periodosPorAnio;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "id_tipo_periodo")
    private Long idTipoPeriodo;
}
