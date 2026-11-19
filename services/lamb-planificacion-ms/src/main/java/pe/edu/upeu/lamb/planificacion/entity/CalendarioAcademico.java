package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

// CRUD 3 · Calendario academico del periodo por sede
@Entity
@Table(name = "calendarios_academicos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarioAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo", nullable = false)
    private PeriodoAcademico periodo;

    // FUSION: Sede/Filial es del MS de organizacion, que aun no existe en el repo. Solo se guarda el id
    @Column(name = "id_sede", nullable = false)
    private Long idSede;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "resolucion", nullable = true, length = 50)
    private String resolucion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoCalendario estado;

    // "Actividades generales": documento oficial del calendario (PDF o Google Drive)
    @Column(name = "url_documento", length = 500)
    private String urlDocumento;

    @Column(name = "nombre_archivo", length = 150)
    private String nombreArchivo;

    // Como ve el alumno su horario: HMC = en el calendario, HML = en lista
    @Column(name = "modo_horario_alumno", nullable = false, length = 10)
    @Builder.Default
    private String modoHorarioAlumno = "HMC";
}
