package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.dto.ConformidadSilaboRequest;
import pe.edu.upeu.lamb.planificacion.dto.ConformidadSilaboResponse;
import pe.edu.upeu.lamb.planificacion.entity.ConformidadSilabo;
import pe.edu.upeu.lamb.planificacion.entity.Grupo;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.repository.ConformidadSilaboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConformidadSilaboService {

    private final ConformidadSilaboRepository repository;
    private final GrupoService grupoService;

    @Transactional(readOnly = true)
    public List<ConformidadSilaboResponse> listar(Long idGrupo) {
        List<ConformidadSilabo> lista = idGrupo == null ? repository.findAll() : repository.findByGrupoId(idGrupo);
        return lista.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ConformidadSilaboResponse obtener(Long id) {
        return toResponse(buscarOFallar(id));
    }

    // La conformidad es una constancia: se registra una sola vez y no se edita
    @Transactional
    public ConformidadSilaboResponse crear(ConformidadSilaboRequest request) {
        Grupo grupo = grupoService.buscarOFallar(request.getIdGrupo());
        grupoService.validarNoAnulado(grupo);
        if (repository.existsByGrupoIdAndIdPersona(grupo.getId(), request.getIdPersona())) {
            throw new BusinessRuleException("El estudiante " + request.getIdPersona() + " ya dio su conformidad al silabo del grupo " + grupo.getCodigo());
        }
        return toResponse(repository.save(ConformidadSilabo.builder()
                .grupo(grupo)
                .idPersona(request.getIdPersona())
                .fecha(LocalDateTime.now())
                .build()));
    }

    @Transactional
    public void eliminar(Long id) {
        repository.delete(buscarOFallar(id));
    }

    private ConformidadSilabo buscarOFallar(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Conformidad de silabo no encontrada: " + id));
    }

    private ConformidadSilaboResponse toResponse(ConformidadSilabo c) {
        return ConformidadSilaboResponse.builder()
                .id(c.getId())
                .idGrupo(c.getGrupo().getId())
                .codigoGrupo(c.getGrupo().getCodigo())
                .idPersona(c.getIdPersona())
                .fecha(c.getFecha())
                .build();
    }
}
