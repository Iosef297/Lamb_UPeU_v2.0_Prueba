package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.dto.CursoIntensivoRequest;
import pe.edu.upeu.lamb.planificacion.dto.CursoIntensivoResponse;
import pe.edu.upeu.lamb.planificacion.entity.CursoIntensivo;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.mapper.CursoIntensivoMapper;
import pe.edu.upeu.lamb.planificacion.repository.CursoIntensivoRepository;
import pe.edu.upeu.lamb.planificacion.repository.CursoRepository;
import pe.edu.upeu.lamb.planificacion.repository.PeriodoAcademicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CursoIntensivoService {

    private final CursoIntensivoRepository cursoIntensivoRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final CursoRepository cursoRepository;
    private final CursoIntensivoMapper cursoIntensivoMapper;

    @Transactional(readOnly = true)
    public List<CursoIntensivoResponse> listar(Long idPeriodo) {
        List<CursoIntensivo> lista = idPeriodo == null
                ? cursoIntensivoRepository.findAll()
                : cursoIntensivoRepository.findByPeriodoId(idPeriodo);
        return lista.stream().map(cursoIntensivoMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CursoIntensivoResponse obtener(Long id) {
        return cursoIntensivoMapper.toResponse(buscarOFallar(id));
    }

    @Transactional
    public CursoIntensivoResponse crear(CursoIntensivoRequest request) {
        validar(request, null);
        CursoIntensivo curso = cursoIntensivoMapper.toEntity(request);
        asignarRelaciones(curso, request);
        return cursoIntensivoMapper.toResponse(cursoIntensivoRepository.save(curso));
    }

    @Transactional
    public CursoIntensivoResponse actualizar(Long id, CursoIntensivoRequest request) {
        CursoIntensivo curso = buscarOFallar(id);
        validar(request, id);
        curso.setCupoMinimo(request.getCupoMinimo());
        curso.setCupoMaximo(request.getCupoMaximo());
        curso.setFechaInicio(request.getFechaInicio());
        curso.setFechaFin(request.getFechaFin());
        asignarRelaciones(curso, request);
        return cursoIntensivoMapper.toResponse(cursoIntensivoRepository.save(curso));
    }

    @Transactional
    public void eliminar(Long id) {
        cursoIntensivoRepository.delete(buscarOFallar(id));
    }

    CursoIntensivo buscarOFallar(Long id) {
        return cursoIntensivoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso intensivo no encontrado: " + id));
    }

    private void validar(CursoIntensivoRequest request, Long id) {
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new BusinessRuleException("Fecha fin no puede ser anterior a fecha inicio");
        }
        if (request.getCupoMinimo() > request.getCupoMaximo()) {
            throw new BusinessRuleException("El cupo minimo no puede ser mayor que el cupo maximo");
        }
        boolean duplicado = id == null
                ? cursoIntensivoRepository.existsByPeriodoIdAndCursoId(request.getIdPeriodo(), request.getIdCurso())
                : cursoIntensivoRepository.existsByPeriodoIdAndCursoIdAndIdNot(request.getIdPeriodo(), request.getIdCurso(), id);
        if (duplicado) {
            throw new BusinessRuleException("Ya existe un curso intensivo de ese curso en ese periodo");
        }
    }

    private void asignarRelaciones(CursoIntensivo curso, CursoIntensivoRequest request) {
        curso.setPeriodo(periodoAcademicoRepository.findById(request.getIdPeriodo())
                .orElseThrow(() -> new ResourceNotFoundException("Periodo academico no encontrado: " + request.getIdPeriodo())));
        curso.setCurso(cursoRepository.findById(request.getIdCurso())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado: " + request.getIdCurso())));
    }
}
