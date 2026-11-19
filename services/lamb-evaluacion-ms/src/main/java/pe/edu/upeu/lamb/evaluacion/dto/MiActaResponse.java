package pe.edu.upeu.lamb.evaluacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Vista docente: un grupo del docente con su acta y lo que puede hacer en el. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MiActaResponse {
    private Long idGrupo;
    private String rol;
    private Boolean gestionaNota;
    private Boolean gestionaAsistencia;
    private Long idActa;
    private String codigoCurso;
    private String periodo;
    private String estado;
    private String modoEvaluacion;
    private Boolean notasHabilitadas;
    private Boolean asistenciaHabilitada;
    // Lo que el docente puede hacer hoy: permiso de su asignacion + acta abierta + permiso del grupo
    private Boolean puedeRegistrarNotas;
    private Boolean puedeRegistrarAsistencia;
}
