package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * CRUD 7 · Grupo. Cabecera de la operacion transaccional del microservicio:
 * el grupo se abre junto con sus horarios (Grupo x Ambiente) y sus docentes (Grupo x Docente)
 * en una sola transaccion, como Orden / DetalleOrden.
 */
@Entity
@Table(name = "grupos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // La oferta da el curso, el periodo y el programa del grupo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_oferta", nullable = false)
    private OfertaAcademica oferta;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo;

    // Ciclo de la cohorte que lleva este grupo (si falta, vale el de la oferta)
    @Column(name = "ciclo")
    private Integer ciclo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoGrupo estado;

    @Column(name = "motivo", length = 255)
    private String motivo;

    // Bloqueo optimista: dos ediciones simultaneas del mismo grupo -> la segunda recibe 409
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @OneToMany(mappedBy = "grupo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("diaSemana ASC, horaInicio ASC")
    @Builder.Default
    private List<HorarioGrupo> horarios = new ArrayList<>();

    @OneToMany(mappedBy = "grupo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Builder.Default
    private List<AsignacionDocente> docentes = new ArrayList<>();

    public Curso getCurso() {
        return oferta.getCurso();
    }

    public PeriodoAcademico getPeriodo() {
        return oferta.getPeriodo();
    }

    // Permiso por grupo (LAMB: puede_editar_silabo): el admin lo abre y lo cierra; solo restringe al docente
    @Column(name = "puede_editar_silabo", nullable = false)
    @Builder.Default
    private Boolean puedeEditarSilabo = true;

    // Delegado del grupo (idPersona de un estudiante; LAMB: id_delegado)
    @Column(name = "id_delegado")
    private Long idDelegado;
}
