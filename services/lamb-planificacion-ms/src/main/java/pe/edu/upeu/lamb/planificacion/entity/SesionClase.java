package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

// CRUD 26 · Sesion de clase del silabo
@Entity
@Table(name = "sesiones_clase")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SesionClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_silabo", nullable = false)
    private SilaboGrupo silabo;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "semana", nullable = false)
    private Integer semana;

    @Column(name = "tema", nullable = false, length = 255)
    private String tema;

    // Unidad de aprendizaje: se jala de lamb-curriculo-ms (CRUD 16 de curriculo)
    @Column(name = "id_unidad_aprendizaje", nullable = true)
    private Long idUnidadAprendizaje;

    @Column(name = "actividades", nullable = true, length = 1000)
    private String actividades;

    // TEORIA o PRACTICA (asistencia "Sesion 2: Teoria")
    @Column(name = "tipo_sesion", length = 20)
    private String tipoSesion;

    @Column(name = "fecha")
    private java.time.LocalDate fecha;

    @Column(name = "horas_teoria")
    private Integer horasTeoria;

    @Column(name = "horas_practica")
    private Integer horasPractica;

    @Column(name = "horas_autonomas")
    private Integer horasAutonomas;

    @Column(name = "actividad_practica", length = 1000)
    private String actividadPractica;

    @Column(name = "actividad_autonoma", length = 1000)
    private String actividadAutonoma;

    // Plan de clase: evidencia, instrumentos y criterios, fase sincrona y asincrona
    @Column(name = "evidencia", length = 500)
    private String evidencia;

    @Column(name = "instrumentos", length = 1000)
    private String instrumentos;

    @Column(name = "actividad_sincrona", length = 2000)
    private String actividadSincrona;

    @Column(name = "actividad_asincrona", length = 2000)
    private String actividadAsincrona;

    @Column(name = "adjunto_url", length = 500)
    private String adjuntoUrl;
}
