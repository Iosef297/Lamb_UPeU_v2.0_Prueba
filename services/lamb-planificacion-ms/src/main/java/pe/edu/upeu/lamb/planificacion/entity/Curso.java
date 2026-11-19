package pe.edu.upeu.lamb.planificacion.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cursos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, length = 20, unique = true)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "creditos", nullable = false)
    private Integer creditos;

    // Horas semanales del curso (HT, HP, HNP) copiadas de lamb-curriculo-ms con el evento plan.publicado
    @Column(name = "horas_teoria", nullable = false)
    @Builder.Default
    private Integer horasTeoria = 0;

    @Column(name = "horas_practica", nullable = false)
    @Builder.Default
    private Integer horasPractica = 0;

    @Column(name = "horas_no_presenciales", nullable = false)
    @Builder.Default
    private Integer horasNoPresenciales = 0;
}
