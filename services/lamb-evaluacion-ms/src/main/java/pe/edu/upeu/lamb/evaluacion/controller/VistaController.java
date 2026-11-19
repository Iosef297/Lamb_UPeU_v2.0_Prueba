package pe.edu.upeu.lamb.evaluacion.controller;

import pe.edu.upeu.lamb.evaluacion.service.CalculoNotasService;
import pe.edu.upeu.lamb.evaluacion.dto.ResumenCompetenciasResponse;
import pe.edu.upeu.lamb.evaluacion.dto.ActaNotasResponse;
import pe.edu.upeu.lamb.evaluacion.dto.EstadisticaGrupoResponse;
import pe.edu.upeu.lamb.evaluacion.dto.HistorialActaResponse;
import pe.edu.upeu.lamb.evaluacion.dto.MeritoResponse;
import pe.edu.upeu.lamb.evaluacion.dto.NotaFinalResponse;
import pe.edu.upeu.lamb.evaluacion.dto.ResultadoPreguntaResponse;
import pe.edu.upeu.lamb.evaluacion.service.VistaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Vistas calculadas: solo lectura, se arman con datos de otros CRUD y no tienen tabla propia
@Tag(name = "Vistas", description = "Vistas calculadas de evaluacion (solo lectura)")
@RestController
@RequestMapping("/api/v1/vistas")
@RequiredArgsConstructor
public class VistaController {

    private final VistaService vistaService;
    private final CalculoNotasService calculoNotasService;
    private final pe.edu.upeu.lamb.evaluacion.service.RepitenciaService repitenciaService;
    private final pe.edu.upeu.lamb.evaluacion.service.DocenteGrupoService docenteGrupoService;
    private final pe.edu.upeu.lamb.evaluacion.repository.ActaRepository actaRepository;

    // Vista docente: sus grupos (idPersona del JWT) con el acta y los permisos efectivos
    @GetMapping("/mis-actas")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<pe.edu.upeu.lamb.evaluacion.dto.MiActaResponse> misActas(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        Long idDocente = pe.edu.upeu.lamb.evaluacion.config.JwtClaims.idPersona(jwt);
        return docenteGrupoService.delDocente(idDocente).stream().map(d -> {
            var acta = actaRepository.findByIdGrupo(d.getIdGrupo()).orElse(null);
            boolean abierta = acta != null && acta.getEstado() == pe.edu.upeu.lamb.evaluacion.entity.EstadoActa.ABIERTA;
            return pe.edu.upeu.lamb.evaluacion.dto.MiActaResponse.builder()
                    .idGrupo(d.getIdGrupo())
                    .rol(d.getRol())
                    .gestionaNota(d.getGestionaNota())
                    .gestionaAsistencia(d.getGestionaAsistencia())
                    .idActa(acta == null ? null : acta.getId())
                    .codigoCurso(acta == null ? null : acta.getCodigoCurso())
                    .periodo(acta == null ? null : acta.getPeriodo())
                    .estado(acta == null ? null : acta.getEstado().name())
                    .modoEvaluacion(acta == null || acta.getModoEvaluacion() == null ? null : acta.getModoEvaluacion().name())
                    .notasHabilitadas(acta == null ? null : acta.getNotasHabilitadas())
                    .asistenciaHabilitada(acta == null ? null : acta.getAsistenciaHabilitada())
                    .puedeRegistrarNotas(abierta && d.getGestionaNota() && Boolean.TRUE.equals(acta.getNotasHabilitadas()))
                    .puedeRegistrarAsistencia(acta != null && acta.getEstado() != pe.edu.upeu.lamb.evaluacion.entity.EstadoActa.CERRADA
                            && d.getGestionaAsistencia() && Boolean.TRUE.equals(acta.getAsistenciaHabilitada()))
                    .build();
        }).toList();
    }

    @GetMapping("/acta-notas/{idActa}")
    public ActaNotasResponse actaNotas(@PathVariable Long idActa) {
        return vistaService.actaNotas(idActa);
    }

    @GetMapping("/historial-acta/{idActa}")
    public List<HistorialActaResponse> historialActa(@PathVariable Long idActa) {
        return vistaService.historialActa(idActa);
    }

    @GetMapping("/nota-final")
    public NotaFinalResponse notaFinal(@RequestParam Long idGrupo, @RequestParam Long idPersona) {
        return vistaService.notaFinal(idGrupo, idPersona);
    }

    // Promedio de grupo + estadistica de aprobados y desaprobados
    // Desaprobados de un curso (y sus equivalentes, separados por coma) que aun no lo aprueban: demanda del curso intensivo
    @GetMapping("/desaprobados-por-curso")
    public pe.edu.upeu.lamb.evaluacion.dto.DesaprobadosCursoResponse desaprobadosPorCurso(@RequestParam List<String> codigos) {
        return repitenciaService.desaprobados(codigos);
    }

    @GetMapping("/estadistica-grupo/{idGrupo}")
    public EstadisticaGrupoResponse estadisticaGrupo(@PathVariable Long idGrupo) {
        return vistaService.estadisticaGrupo(idGrupo);
    }

    // Cuadro de meritos / tercio superior del periodo
    @GetMapping("/cuadro-meritos")
    public List<MeritoResponse> cuadroMeritos(@RequestParam String periodo) {
        return vistaService.cuadroMeritos(periodo);
    }

    @GetMapping("/resultado-evaluacion-docente")
    public List<ResultadoPreguntaResponse> resultadoEvaluacionDocente(@RequestParam Long idEncuesta, @RequestParam Long idDocente) {
        return vistaService.resultadoEvaluacionDocente(idEncuesta, idDocente);
    }

    // "Resumen de evaluaciones (Modo competencia)": ES, EP, ECG y nota final de cada estudiante del grupo
    @GetMapping("/resumen-competencias/{idGrupo}")
    public List<ResumenCompetenciasResponse> resumenCompetencias(@PathVariable Long idGrupo) {
        return calculoNotasService.resumenCompetencias(idGrupo);
    }
}
