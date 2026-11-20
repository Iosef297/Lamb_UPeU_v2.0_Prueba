package pe.edu.upeu.ingresospagos.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.upeu.ingresospagos.dto.NotaCreditoDebitoRequest;
import pe.edu.upeu.ingresospagos.dto.NotaCreditoDebitoResponse;
import pe.edu.upeu.ingresospagos.entity.NotaCreditoDebito;
import pe.edu.upeu.ingresospagos.exception.ResourceNotFoundException;
import pe.edu.upeu.ingresospagos.mapper.NotaCreditoDebitoMapper;
import pe.edu.upeu.ingresospagos.repository.NotaCreditoDebitoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaCreditoDebitoService {

    private final NotaCreditoDebitoRepository notaCreditoDebitoRepository;
    private final NotaCreditoDebitoMapper notaCreditoDebitoMapper;

    public List<NotaCreditoDebitoResponse> listar() {
        return notaCreditoDebitoRepository.findAll().stream()
                .map(notaCreditoDebitoMapper::toResponse)
                .toList();
    }

    public NotaCreditoDebitoResponse obtener(Long id) {
        return notaCreditoDebitoMapper.toResponse(buscarOFallar(id));
    }

    public NotaCreditoDebitoResponse crear(NotaCreditoDebitoRequest request) {
        NotaCreditoDebito notaCreditoDebito = notaCreditoDebitoMapper.toEntity(request);
        return notaCreditoDebitoMapper.toResponse(notaCreditoDebitoRepository.save(notaCreditoDebito));
    }

    public NotaCreditoDebitoResponse actualizar(Long id, NotaCreditoDebitoRequest request) {
        NotaCreditoDebito notaCreditoDebito = buscarOFallar(id);
        notaCreditoDebito.setTipo(request.getTipo());
        notaCreditoDebito.setMotivo(request.getMotivo());
        notaCreditoDebito.setMonto(request.getMonto());
        notaCreditoDebito.setIdPago(request.getPagoId());
        return notaCreditoDebitoMapper.toResponse(notaCreditoDebitoRepository.save(notaCreditoDebito));
    }

    public void eliminar(Long id) {
        notaCreditoDebitoRepository.delete(buscarOFallar(id));
    }

    private NotaCreditoDebito buscarOFallar(Long id) {
        return notaCreditoDebitoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nota de credito/debito no encontrada: " + id));
    }
}
