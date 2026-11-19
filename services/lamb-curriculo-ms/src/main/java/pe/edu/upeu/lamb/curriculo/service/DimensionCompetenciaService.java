package pe.edu.upeu.lamb.curriculo.service;

import pe.edu.upeu.lamb.curriculo.dto.DimensionCompetenciaRequest;
import pe.edu.upeu.lamb.curriculo.dto.DimensionCompetenciaResponse;
import pe.edu.upeu.lamb.curriculo.entity.DimensionCompetencia;
import pe.edu.upeu.lamb.curriculo.exception.BusinessRuleException;
import pe.edu.upeu.lamb.curriculo.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.curriculo.repository.CompetenciaEspecificaRepository;
import pe.edu.upeu.lamb.curriculo.repository.CompetenciaGeneralRepository;
import pe.edu.upeu.lamb.curriculo.repository.DimensionCompetenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DimensionCompetenciaService {

    private final DimensionCompetenciaRepository repository;
    private final CompetenciaGeneralRepository competenciaGeneralRepository;
    private final CompetenciaEspecificaRepository competenciaEspecificaRepository;

    @Transactional(readOnly = true)
    public List<DimensionCompetenciaResponse> listar(String tipoCompetencia, Long idCompetencia) {
        List<DimensionCompetencia> lista = tipoCompetencia != null && idCompetencia != null
                ? repository.findByTipoCompetenciaAndIdCompetenciaOrderByNumero(tipoCompetencia, idCompetencia)
                : repository.findAll().stream()
                        .filter(d -> tipoCompetencia == null || d.getTipoCompetencia().equals(tipoCompetencia))
                        .filter(d -> idCompetencia == null || d.getIdCompetencia().equals(idCompetencia))
                        .sorted(Comparator.comparing(DimensionCompetencia::getIdCompetencia).thenComparing(DimensionCompetencia::getNumero))
                        .toList();
        return lista.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DimensionCompetenciaResponse obtener(Long id) {
        return toResponse(buscarOFallar(id));
    }

    @Transactional
    public DimensionCompetenciaResponse crear(DimensionCompetenciaRequest request) {
        validar(request, 0L);
        return toResponse(repository.save(DimensionCompetencia.builder()
                .tipoCompetencia(request.getTipoCompetencia())
                .idCompetencia(request.getIdCompetencia())
                .numero(request.getNumero())
                .descripcion(request.getDescripcion().trim())
                .build()));
    }

    @Transactional
    public DimensionCompetenciaResponse actualizar(Long id, DimensionCompetenciaRequest request) {
        DimensionCompetencia d = buscarOFallar(id);
        validar(request, id);
        d.setTipoCompetencia(request.getTipoCompetencia());
        d.setIdCompetencia(request.getIdCompetencia());
        d.setNumero(request.getNumero());
        d.setDescripcion(request.getDescripcion().trim());
        return toResponse(repository.save(d));
    }

    @Transactional
    public void eliminar(Long id) {
        repository.delete(buscarOFallar(id));
    }

    private void validar(DimensionCompetenciaRequest request, Long id) {
        nombreCompetencia(request.getTipoCompetencia(), request.getIdCompetencia());
        if (repository.existsByTipoCompetenciaAndIdCompetenciaAndNumeroAndIdNot(
                request.getTipoCompetencia(), request.getIdCompetencia(), request.getNumero(), id)) {
            throw new BusinessRuleException("La competencia ya tiene la dimension " + request.getNumero());
        }
    }

    private String nombreCompetencia(String tipo, Long idCompetencia) {
        return "GENERAL".equals(tipo)
                ? competenciaGeneralRepository.findById(idCompetencia)
                        .orElseThrow(() -> new ResourceNotFoundException("Competencia general no encontrada: " + idCompetencia)).getNombre()
                : competenciaEspecificaRepository.findById(idCompetencia)
                        .orElseThrow(() -> new ResourceNotFoundException("Competencia especifica no encontrada: " + idCompetencia)).getNombre();
    }

    private DimensionCompetencia buscarOFallar(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Dimension de competencia no encontrada: " + id));
    }

    private DimensionCompetenciaResponse toResponse(DimensionCompetencia d) {
        String nombre;
        try {
            nombre = nombreCompetencia(d.getTipoCompetencia(), d.getIdCompetencia());
        } catch (ResourceNotFoundException e) {
            nombre = null;
        }
        return DimensionCompetenciaResponse.builder()
                .id(d.getId())
                .tipoCompetencia(d.getTipoCompetencia())
                .idCompetencia(d.getIdCompetencia())
                .nombreCompetencia(nombre)
                .numero(d.getNumero())
                .descripcion(d.getDescripcion())
                .build();
    }
}
