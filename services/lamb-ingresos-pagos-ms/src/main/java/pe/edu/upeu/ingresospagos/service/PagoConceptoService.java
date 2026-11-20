package pe.edu.upeu.ingresospagos.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.upeu.ingresospagos.dto.PagoConceptoRequest;
import pe.edu.upeu.ingresospagos.dto.PagoConceptoResponse;
import pe.edu.upeu.ingresospagos.entity.PagoConcepto;
import pe.edu.upeu.ingresospagos.entity.SesionCaja;
import pe.edu.upeu.ingresospagos.exception.ResourceNotFoundException;
import pe.edu.upeu.ingresospagos.mapper.PagoConceptoMapper;
import pe.edu.upeu.ingresospagos.repository.PagoConceptoRepository;
import pe.edu.upeu.ingresospagos.repository.SesionCajaRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PagoConceptoService {

    private final PagoConceptoRepository pagoConceptoRepository;
    private final PagoConceptoMapper pagoConceptoMapper;
    private final SesionCajaRepository sesionCajaRepository;

    public List<PagoConceptoResponse> listar() {
        return pagoConceptoRepository.findAll().stream()
                .map(pagoConceptoMapper::toResponse)
                .toList();
    }

    public List<PagoConceptoResponse> listarPorEstudiante(String idEstudiante) {
        return pagoConceptoRepository.findByIdEstudiante(idEstudiante).stream()
                .map(pagoConceptoMapper::toResponse)
                .toList();
    }

    public PagoConceptoResponse obtener(Long id) {
        return pagoConceptoMapper.toResponse(buscarOFallar(id));
    }

    public PagoConceptoResponse crear(PagoConceptoRequest request) {
        PagoConcepto pagoConcepto = pagoConceptoMapper.toEntity(request);
        pagoConcepto.setSesionCaja(request.getSesionCajaId() == null ? null : buscarSesionCajaOFallar(request.getSesionCajaId()));
        return pagoConceptoMapper.toResponse(pagoConceptoRepository.save(pagoConcepto));
    }

    public PagoConceptoResponse actualizar(Long id, PagoConceptoRequest request) {
        PagoConcepto pagoConcepto = buscarOFallar(id);
        pagoConcepto.setIdEstudiante(request.getIdEstudiante());
        pagoConcepto.setMonto(request.getMonto());
        pagoConcepto.setObservacion(request.getObservacion());
        pagoConcepto.setIdConceptoPago(request.getConceptoPagoId());
        pagoConcepto.setIdMetodoPago(request.getMetodoPagoId());
        pagoConcepto.setSesionCaja(request.getSesionCajaId() == null ? null : buscarSesionCajaOFallar(request.getSesionCajaId()));
        return pagoConceptoMapper.toResponse(pagoConceptoRepository.save(pagoConcepto));
    }

    public void eliminar(Long id) {
        pagoConceptoRepository.delete(buscarOFallar(id));
    }

    private PagoConcepto buscarOFallar(Long id) {
        return pagoConceptoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado: " + id));
    }

    private SesionCaja buscarSesionCajaOFallar(Long id) {
        return sesionCajaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sesion de caja no encontrada: " + id));
    }
}
