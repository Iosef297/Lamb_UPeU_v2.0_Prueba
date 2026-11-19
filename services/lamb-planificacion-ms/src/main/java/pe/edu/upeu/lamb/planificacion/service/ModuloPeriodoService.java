package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.dto.ModuloPeriodoRequest;
import pe.edu.upeu.lamb.planificacion.dto.ModuloPeriodoResponse;
import pe.edu.upeu.lamb.planificacion.entity.ModuloPeriodo;
import pe.edu.upeu.lamb.planificacion.entity.PeriodoAcademico;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.repository.ModuloPeriodoRepository;
import pe.edu.upeu.lamb.planificacion.repository.PeriodoAcademicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuloPeriodoService {

    private final ModuloPeriodoRepository repository;
    private final PeriodoAcademicoRepository periodoRepository;

    @Transactional(readOnly = true)
    public List<ModuloPeriodoResponse> listar(Long idPeriodo) {
        List<ModuloPeriodo> lista = idPeriodo == null ? repository.findAll() : repository.findByPeriodoIdOrderByFechaInicio(idPeriodo);
        return lista.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ModuloPeriodoResponse obtener(Long id) {
        return toResponse(buscarOFallar(id));
    }

    @Transactional
    public ModuloPeriodoResponse crear(ModuloPeriodoRequest request) {
        ModuloPeriodo m = new ModuloPeriodo();
        aplicar(m, request, 0L);
        return toResponse(repository.save(m));
    }

    @Transactional
    public ModuloPeriodoResponse actualizar(Long id, ModuloPeriodoRequest request) {
        ModuloPeriodo m = buscarOFallar(id);
        aplicar(m, request, id);
        return toResponse(repository.save(m));
    }

    @Transactional
    public void eliminar(Long id) {
        repository.delete(buscarOFallar(id));
    }

    ModuloPeriodo buscarOFallar(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Modulo del periodo no encontrado: " + id));
    }

    // El modulo cae dentro del periodo y no se repite el nombre en el mismo periodo
    private void aplicar(ModuloPeriodo m, ModuloPeriodoRequest request, Long id) {
        PeriodoAcademico periodo = periodoRepository.findById(request.getIdPeriodo())
                .orElseThrow(() -> new ResourceNotFoundException("Periodo academico no encontrado: " + request.getIdPeriodo()));
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new BusinessRuleException("La fecha de fin del modulo no puede ser anterior a la de inicio");
        }
        if (request.getFechaInicio().isBefore(periodo.getFechaInicio()) || request.getFechaFin().isAfter(periodo.getFechaFin())) {
            throw new BusinessRuleException("El modulo debe estar dentro del periodo " + periodo.getCodigo()
                    + " (" + periodo.getFechaInicio() + " a " + periodo.getFechaFin() + ")");
        }
        if (repository.existsByPeriodoIdAndNombreAndIdNot(periodo.getId(), request.getNombre().trim(), id)) {
            throw new BusinessRuleException("Ya existe el modulo " + request.getNombre() + " en el periodo " + periodo.getCodigo());
        }
        m.setPeriodo(periodo);
        m.setNombre(request.getNombre().trim());
        m.setCodigo(request.getCodigo().trim().toUpperCase());
        m.setFormato(request.getFormato());
        m.setFechaInicio(request.getFechaInicio());
        m.setFechaFin(request.getFechaFin());
    }

    private ModuloPeriodoResponse toResponse(ModuloPeriodo m) {
        return ModuloPeriodoResponse.builder()
                .id(m.getId())
                .idPeriodo(m.getPeriodo().getId())
                .codigoPeriodo(m.getPeriodo().getCodigo())
                .nombre(m.getNombre())
                .codigo(m.getCodigo())
                .formato(m.getFormato())
                .fechaInicio(m.getFechaInicio())
                .fechaFin(m.getFechaFin())
                .build();
    }
}
