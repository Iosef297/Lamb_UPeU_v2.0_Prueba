package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

// CRUD 4 · Hito del calendario (inicio, examenes, cierre de notas)
@Entity
@Table(name = "hitos_calendario")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HitoCalendario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_calendario", nullable = false)
    private CalendarioAcademico calendario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoHito tipo;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    // Participante del LAMB: area que publica la actividad
    @Enumerated(EnumType.STRING)
    @Column(name = "area_responsable", nullable = false, length = 20)
    @Builder.Default
    private AreaResponsable areaResponsable = AreaResponsable.ACADEMICO;

    // Alcance: la sede viene del calendario; si hay programa, solo aplica a esa escuela
    @Column(name = "id_programa")
    private Long idPrograma;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoHito estado = EstadoHito.PUBLICADO;

    @Column(name = "visible_alumno", nullable = false)
    @Builder.Default
    private Boolean visibleAlumno = true;
}
