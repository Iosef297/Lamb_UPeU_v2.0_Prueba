package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

/**
 * CRUD 17 · Horario de grupo. Detalle de la relacion muchos a muchos Grupo x Ambiente
 * (dia y rango de horas son los atributos de la relacion).
 */
@Entity
@Table(name = "horarios_grupo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorarioGrupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_grupo", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    // null = ambiente "Por confirmar" (no se valida aforo ni cruce de ambiente)
    @JoinColumn(name = "id_ambiente")
    private Ambiente ambiente;

    // Copia del periodo de la oferta: la usa el constraint EXCLUDE que impide cruces de ambiente
    @Column(name = "id_periodo", nullable = false)
    private Long idPeriodo;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false, length = 30)
    private DiaSemana diaSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    // false cuando el grupo se anula: el ambiente queda libre en ese horario
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    // Rango de fechas en que rige el horario (null = todo el periodo)
    @Column(name = "fecha_inicio")
    private java.time.LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private java.time.LocalDate fechaFin;

    // Tipo del LAMB: T / T1 / P1 = TEORIA o PRACTICA + numero de subgrupo
    @Column(name = "tipo_horario", nullable = false, length = 20)
    @Builder.Default
    private String tipoHorario = "TEORIA";

    @Column(name = "numero_subgrupo")
    private Integer numeroSubgrupo;

    // Docente del grupo que dicta este bloque (null = lo dictan los docentes del grupo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignacion_docente")
    private AsignacionDocente asignacionDocente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modulo")
    private ModuloPeriodo modulo;

    /** "T", "T1", "P1" como en el LAMB. */
    public String codigoTipo() {
        return ("PRACTICA".equals(tipoHorario) ? "P" : "T") + (numeroSubgrupo == null ? "" : numeroSubgrupo);
    }

    /** "Teoria", "Practica 1". */
    public String etiquetaTipo() {
        return ("PRACTICA".equals(tipoHorario) ? "Práctica" : "Teoría") + (numeroSubgrupo == null ? "" : " " + numeroSubgrupo);
    }
}
