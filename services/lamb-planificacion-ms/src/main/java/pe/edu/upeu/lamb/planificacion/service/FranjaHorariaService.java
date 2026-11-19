package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.dto.FranjaHorariaRequest;
import pe.edu.upeu.lamb.planificacion.dto.FranjaHorariaResponse;
import pe.edu.upeu.lamb.planificacion.entity.FranjaHoraria;
import pe.edu.upeu.lamb.planificacion.entity.Turno;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.repository.FranjaHorariaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Catalogo de franjas pedagogicas (H5). */
@Service
@RequiredArgsConstructor
public class FranjaHorariaService {

    private final FranjaHorariaRepository franjaHorariaRepository;

    @Transactional(readOnly = true)
    public List<FranjaHorariaResponse> listar() {
        return franjaHorariaRepository.findAllByOrderByOrdenAsc().stream().map(FranjaHorariaService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public FranjaHorariaResponse obtener(Long id) {
        return toResponse(buscarOFallar(id));
    }

    @Transactional
    public FranjaHorariaResponse crear(FranjaHorariaRequest request) {
        validar(request, null);
        FranjaHoraria franja = FranjaHoraria.builder().build();
        aplicar(franja, request);
        return toResponse(franjaHorariaRepository.save(franja));
    }

    @Transactional
    public FranjaHorariaResponse actualizar(Long id, FranjaHorariaRequest request) {
        FranjaHoraria franja = buscarOFallar(id);
        validar(request, id);
        aplicar(franja, request);
        return toResponse(franjaHorariaRepository.save(franja));
    }

    @Transactional
    public void eliminar(Long id) {
        franjaHorariaRepository.delete(buscarOFallar(id));
    }

    private void aplicar(FranjaHoraria franja, FranjaHorariaRequest request) {
        franja.setOrden(request.getOrden());
        franja.setHoraInicio(request.getHoraInicio());
        franja.setHoraFin(request.getHoraFin());
        franja.setTurno(request.getTurno() != null ? request.getTurno() : Turno.de(request.getHoraInicio()));
    }

    private void validar(FranjaHorariaRequest request, Long id) {
        if (!request.getHoraFin().isAfter(request.getHoraInicio())) {
            throw new BusinessRuleException("La hora de fin de la franja debe ser posterior a la de inicio");
        }
        boolean duplicada = id == null
                ? franjaHorariaRepository.existsByOrden(request.getOrden())
                : franjaHorariaRepository.existsByOrdenAndIdNot(request.getOrden(), id);
        if (duplicada) {
            throw new BusinessRuleException("Ya existe la franja F" + request.getOrden());
        }
    }

    private FranjaHoraria buscarOFallar(Long id) {
        return franjaHorariaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Franja horaria no encontrada: " + id));
    }

    static FranjaHorariaResponse toResponse(FranjaHoraria f) {
        return FranjaHorariaResponse.builder()
                .id(f.getId())
                .orden(f.getOrden())
                .codigo("F" + f.getOrden())
                .horaInicio(f.getHoraInicio())
                .horaFin(f.getHoraFin())
                .turno(f.getTurno())
                .build();
    }
}
