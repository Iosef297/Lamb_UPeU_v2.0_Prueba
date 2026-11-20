package pe.edu.upeu.ingresospagos.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.upeu.ingresospagos.dto.LogTransaccionPasarelaRequest;
import pe.edu.upeu.ingresospagos.dto.LogTransaccionPasarelaResponse;
import pe.edu.upeu.ingresospagos.entity.LogTransaccionPasarela;
import pe.edu.upeu.ingresospagos.exception.ResourceNotFoundException;
import pe.edu.upeu.ingresospagos.mapper.LogTransaccionPasarelaMapper;
import pe.edu.upeu.ingresospagos.repository.LogTransaccionPasarelaRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogTransaccionPasarelaService {

    private final LogTransaccionPasarelaRepository logTransaccionPasarelaRepository;
    private final LogTransaccionPasarelaMapper logTransaccionPasarelaMapper;

    public List<LogTransaccionPasarelaResponse> listar() {
        return logTransaccionPasarelaRepository.findAll().stream()
                .map(logTransaccionPasarelaMapper::toResponse)
                .toList();
    }

    public LogTransaccionPasarelaResponse obtener(Long id) {
        return logTransaccionPasarelaMapper.toResponse(buscarOFallar(id));
    }

    public LogTransaccionPasarelaResponse crear(LogTransaccionPasarelaRequest request) {
        LogTransaccionPasarela logTransaccionPasarela = logTransaccionPasarelaMapper.toEntity(request);
        return logTransaccionPasarelaMapper.toResponse(logTransaccionPasarelaRepository.save(logTransaccionPasarela));
    }

    public LogTransaccionPasarelaResponse actualizar(Long id, LogTransaccionPasarelaRequest request) {
        LogTransaccionPasarela logTransaccionPasarela = buscarOFallar(id);
        logTransaccionPasarela.setProveedor(request.getProveedor());
        logTransaccionPasarela.setReferenciaExterna(request.getReferenciaExterna());
        logTransaccionPasarela.setEstado(request.getEstado());
        logTransaccionPasarela.setPayloadRespuesta(request.getPayloadRespuesta());
        logTransaccionPasarela.setIdPago(request.getPagoId());
        return logTransaccionPasarelaMapper.toResponse(logTransaccionPasarelaRepository.save(logTransaccionPasarela));
    }

    public void eliminar(Long id) {
        logTransaccionPasarelaRepository.delete(buscarOFallar(id));
    }

    private LogTransaccionPasarela buscarOFallar(Long id) {
        return logTransaccionPasarelaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Log de transaccion de pasarela no encontrado: " + id));
    }
}
