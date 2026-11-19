package pe.edu.upeu.lamb.evaluacion.service;

import pe.edu.upeu.lamb.evaluacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.evaluacion.dto.EvaluacionProgramadaRequest;
import pe.edu.upeu.lamb.evaluacion.dto.EvaluacionProgramadaResponse;
import pe.edu.upeu.lamb.evaluacion.entity.ComponenteEvaluacion;
import pe.edu.upeu.lamb.evaluacion.entity.EvaluacionProgramada;
import pe.edu.upeu.lamb.evaluacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.evaluacion.mapper.EvaluacionProgramadaMapper;
import pe.edu.upeu.lamb.evaluacion.repository.ComponenteEvaluacionRepository;
import pe.edu.upeu.lamb.evaluacion.repository.EvaluacionProgramadaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluacionProgramadaService {

    private final EvaluacionProgramadaRepository evaluacionProgramadaRepository;
    private final ComponenteEvaluacionRepository componenteEvaluacionRepository;
    private final EvaluacionProgramadaMapper evaluacionProgramadaMapper;

    @Transactional(readOnly = true)
    public List<EvaluacionProgramadaResponse> listar(Long idGrupo) {
        List<EvaluacionProgramada> lista = idGrupo == null
                ? evaluacionProgramadaRepository.findAll()
                : evaluacionProgramadaRepository.findByIdGrupo(idGrupo);
        return lista.stream().map(evaluacionProgramadaMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EvaluacionProgramadaResponse obtener(Long id) {
        return evaluacionProgramadaMapper.toResponse(buscarOFallar(id));
    }

    @Transactional
    public EvaluacionProgramadaResponse crear(EvaluacionProgramadaRequest request) {
        EvaluacionProgramada evaluacionProgramada = evaluacionProgramadaMapper.toEntity(request);
        asignarRelaciones(evaluacionProgramada, request);
        return evaluacionProgramadaMapper.toResponse(evaluacionProgramadaRepository.save(evaluacionProgramada));
    }

    @Transactional
    public EvaluacionProgramadaResponse actualizar(Long id, EvaluacionProgramadaRequest request) {
        EvaluacionProgramada evaluacionProgramada = buscarOFallar(id);
        evaluacionProgramada.setIdGrupo(request.getIdGrupo());
        evaluacionProgramada.setFecha(request.getFecha());
        evaluacionProgramada.setDescripcion(request.getDescripcion());
        asignarRelaciones(evaluacionProgramada, request);
        return evaluacionProgramadaMapper.toResponse(evaluacionProgramadaRepository.save(evaluacionProgramada));
    }

    @Transactional
    public void eliminar(Long id) {
        evaluacionProgramadaRepository.delete(buscarOFallar(id));
    }

    EvaluacionProgramada buscarOFallar(Long id) {
        return evaluacionProgramadaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion programada no encontrada: " + id));
    }

    private void asignarRelaciones(EvaluacionProgramada evaluacionProgramada, EvaluacionProgramadaRequest request) {
        validarPeso(request, evaluacionProgramada.getId());
        evaluacionProgramada.setComponente(componenteEvaluacionRepository.findById(request.getIdComponente())
                .orElseThrow(() -> new ResourceNotFoundException("Componente de evaluacion no encontrado: " + request.getIdComponente())));
    }

    // Las evidencias del grupo (ES + EP + ECG de todas las unidades) suman como maximo 100 %
    private void validarPeso(EvaluacionProgramadaRequest request, Long id) {
        if (request.getPeso() == null) {
            return;
        }
        java.math.BigDecimal otras = evaluacionProgramadaRepository.findByIdGrupo(request.getIdGrupo()).stream()
                .filter(e -> e.getPeso() != null && !e.getId().equals(id))
                .map(EvaluacionProgramada::getPeso)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        java.math.BigDecimal total = otras.add(request.getPeso());
        if (total.compareTo(new java.math.BigDecimal("100")) > 0) {
            throw new BusinessRuleException("Los pesos de las evaluaciones del grupo " + request.getIdGrupo() + " sumarian "
                    + total.stripTrailingZeros().toPlainString() + " %; el maximo es 100 % (ya suman "
                    + otras.stripTrailingZeros().toPlainString() + " %)");
        }
    }
}
