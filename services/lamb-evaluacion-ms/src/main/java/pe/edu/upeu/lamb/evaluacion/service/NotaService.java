package pe.edu.upeu.lamb.evaluacion.service;

import pe.edu.upeu.lamb.evaluacion.repository.EvaluacionProgramadaRepository;
import pe.edu.upeu.lamb.evaluacion.entity.EvaluacionProgramada;
import pe.edu.upeu.lamb.evaluacion.dto.NotaRequest;
import pe.edu.upeu.lamb.evaluacion.dto.NotaResponse;
import pe.edu.upeu.lamb.evaluacion.entity.ComponenteEvaluacion;
import pe.edu.upeu.lamb.evaluacion.entity.EscalaCalificacion;
import pe.edu.upeu.lamb.evaluacion.entity.Nota;
import pe.edu.upeu.lamb.evaluacion.entity.EstadoActa;
import pe.edu.upeu.lamb.evaluacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.evaluacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.evaluacion.repository.ActaRepository;
import pe.edu.upeu.lamb.evaluacion.mapper.NotaMapper;
import pe.edu.upeu.lamb.evaluacion.repository.ComponenteEvaluacionRepository;
import pe.edu.upeu.lamb.evaluacion.repository.NotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaService {

    private final NotaRepository notaRepository;
    private final NotaMapper notaMapper;
    private final ActaRepository actaRepository;
    private final ComponenteEvaluacionRepository componenteEvaluacionRepository;
    private final CalculoNotasService calculoNotasService;
    private final EvaluacionProgramadaRepository evaluacionProgramadaRepository;
    private final DocenteGrupoService docenteGrupoService;

    @Transactional(readOnly = true)
    public List<NotaResponse> listar(Long idGrupo) {
        List<Nota> notas = idGrupo == null ? notaRepository.findAll() : notaRepository.findByIdGrupo(idGrupo);
        return notas.stream()
                .map(notaMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotaResponse obtener(Long id) {
        return notaMapper.toResponse(buscarOFallar(id));
    }

    @Transactional
    public NotaResponse crear(NotaRequest request) {
        validarActaNoCerrada(request.getIdGrupo());
        validarDentroDeEscala(request.getCalificacion());
        Nota nota = notaMapper.toEntity(request);
        nota.setComponente(buscarComponente(request.getIdComponente()));
        validarEvidencia(nota, request.getIdEvaluacionProgramada(), null);
        return notaMapper.toResponse(notaRepository.save(nota));
    }

    @Transactional
    public NotaResponse actualizar(Long id, NotaRequest request) {
        Nota nota = buscarOFallar(id);
        validarActaNoCerrada(nota.getIdGrupo());
        if (!nota.getIdGrupo().equals(request.getIdGrupo())) {
            validarActaNoCerrada(request.getIdGrupo());
        }
        validarDentroDeEscala(request.getCalificacion());
        nota.setIdPersona(request.getIdPersona());
        nota.setIdGrupo(request.getIdGrupo());
        nota.setComponente(buscarComponente(request.getIdComponente()));
        nota.setCalificacion(request.getCalificacion());
        nota.setPeriodo(request.getPeriodo());
        nota.setIdEvaluacionProgramada(request.getIdEvaluacionProgramada());
        validarEvidencia(nota, request.getIdEvaluacionProgramada(), id);
        return notaMapper.toResponse(notaRepository.save(nota));
    }

    @Transactional
    public void eliminar(Long id) {
        Nota nota = buscarOFallar(id);
        validarActaNoCerrada(nota.getIdGrupo());
        notaRepository.delete(nota);
    }

    // Con el acta CERRADA las notas ya se publicaron a trayectoria: no se pueden cambiar
    private void validarActaNoCerrada(Long idGrupo) {
        docenteGrupoService.validarPuedeNotas(idGrupo);
        actaRepository.findByIdGrupo(idGrupo)
                .ifPresent(acta -> {
                    if (acta.getEstado() == EstadoActa.CERRADA || acta.getEstado() == EstadoActa.ANULADA) {
                        throw new BusinessRuleException("El acta del grupo " + idGrupo + " esta " + acta.getEstado() + ": no se pueden registrar ni modificar notas");
                    }
                    if (!Boolean.TRUE.equals(acta.getNotasHabilitadas()) && !pe.edu.upeu.lamb.evaluacion.config.JwtClaims.esGestion()) {
                        throw new BusinessRuleException("El registro de notas del grupo " + idGrupo + " esta cerrado; pide al coordinador que lo habilite");
                    }
                });
    }

    // La calificacion debe caber en la escala vigente (CRUD 3)
    private void validarDentroDeEscala(BigDecimal calificacion) {
        EscalaCalificacion escala = calculoNotasService.escalaVigente();
        if (calificacion.compareTo(escala.getNotaMinima()) < 0 || calificacion.compareTo(escala.getNotaMaxima()) > 0) {
            throw new BusinessRuleException("La calificacion " + calificacion + " esta fuera de la escala " + escala.getCodigo()
                    + " (" + escala.getNotaMinima() + " a " + escala.getNotaMaxima() + ")");
        }
    }

    /**
     * Si la nota es de una evidencia programada (modo competencia): la evidencia debe ser del mismo grupo,
     * el componente pasa a ser el de la evidencia y el estudiante tiene una sola nota por evidencia.
     */
    private void validarEvidencia(Nota nota, Long idEvaluacionProgramada, Long idNota) {
        if (idEvaluacionProgramada == null) {
            return;
        }
        EvaluacionProgramada evidencia = evaluacionProgramadaRepository.findById(idEvaluacionProgramada)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion programada no encontrada: " + idEvaluacionProgramada));
        if (!evidencia.getIdGrupo().equals(nota.getIdGrupo())) {
            throw new BusinessRuleException("La evaluacion programada " + idEvaluacionProgramada + " es del grupo "
                    + evidencia.getIdGrupo() + ", no del grupo " + nota.getIdGrupo());
        }
        nota.setComponente(evidencia.getComponente());
        boolean repetida = notaRepository.findByIdPersonaAndIdGrupo(nota.getIdPersona(), nota.getIdGrupo()).stream()
                .anyMatch(n -> idEvaluacionProgramada.equals(n.getIdEvaluacionProgramada()) && !n.getId().equals(idNota));
        if (repetida) {
            throw new BusinessRuleException("El estudiante " + nota.getIdPersona() + " ya tiene nota en la evaluacion "
                    + (evidencia.getUnidad() != null ? evidencia.getUnidad() + " " : "") + evidencia.getComponente().getCodigo()
                    + "; edita la nota existente");
        }
    }

    private ComponenteEvaluacion buscarComponente(Long idComponente) {
        return componenteEvaluacionRepository.findById(idComponente)
                .orElseThrow(() -> new ResourceNotFoundException("Componente de evaluacion no encontrado: " + idComponente));
    }

    private Nota buscarOFallar(Long id) {
        return notaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nota no encontrada: " + id));
    }
}
