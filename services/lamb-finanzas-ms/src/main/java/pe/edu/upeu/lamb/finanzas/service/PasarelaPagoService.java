package pe.edu.upeu.lamb.finanzas.service;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import pe.edu.upeu.lamb.finanzas.client.IngresosPagosPasarelaClient;
import pe.edu.upeu.lamb.finanzas.dto.PagoResponse;
import pe.edu.upeu.lamb.finanzas.entity.EstadoPago;
import pe.edu.upeu.lamb.finanzas.entity.MetodoPago;
import pe.edu.upeu.lamb.finanzas.entity.Pago;
import pe.edu.upeu.lamb.finanzas.event.PagoAceptadoEvento;
import pe.edu.upeu.lamb.finanzas.exception.BusinessRuleException;
import pe.edu.upeu.lamb.finanzas.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.finanzas.mapper.PagoMapper;
import pe.edu.upeu.lamb.finanzas.messaging.PagoEventosProducer;
import pe.edu.upeu.lamb.finanzas.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Pago con tarjeta via Mercado Pago (Payments API directa: el frontend tokeniza la tarjeta
 * con el SDK JS de MP usando la public key, y aqui solo llega el cardToken).
 * El log de la transaccion (LogTransaccionPasarela) vive en lamb-ingresos-pagos-ms, por eso
 * la llamada M2M via IngresosPagosPasarelaClient tras cada intento.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasarelaPagoService {

    private static final String PROVEEDOR = "MERCADOPAGO";

    private final PagoRepository pagoRepository;
    private final PagoMapper pagoMapper;
    private final PagoEventosProducer pagoEventosProducer;
    private final IngresosPagosPasarelaClient pasarelaClient;

    @Transactional
    public PagoResponse pagarConTarjeta(Long idPago, String cardToken, String payerEmail) {
        Pago pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado: " + idPago));
        if (pago.getEstado() != EstadoPago.EN_PROCESO) {
            throw new BusinessRuleException("No se puede pagar con pasarela el pago " + idPago
                    + ": esta en estado " + pago.getEstado() + ", se esperaba EN_PROCESO");
        }

        Payment resultado = crearPagoEnMercadoPago(pago, cardToken, payerEmail);

        String estadoMp = resultado.getStatus();
        boolean aprobado = "approved".equals(estadoMp);

        pago.setMetodo(MetodoPago.TARJETA);
        pago.setReferenciaExterna(String.valueOf(resultado.getId()));
        pago.setEstado(aprobado ? EstadoPago.APROBADO : EstadoPago.RECHAZADO);
        Pago guardado = pagoRepository.save(pago);

        registrarLog(guardado.getId(), estadoMp, resultado);

        if (aprobado) {
            pagoEventosProducer.publicarTrasCommit(PagoAceptadoEvento.builder()
                    .tipoEvento("pago.aceptado")
                    .idPago(guardado.getId())
                    .matriculaId(guardado.getMatriculaId())
                    .idPersona(guardado.getIdPersona())
                    .monto(guardado.getMonto())
                    .fechaAceptacion(Instant.now())
                    .build());
        }

        return pagoMapper.toResponse(guardado);
    }

    private Payment crearPagoEnMercadoPago(Pago pago, String cardToken, String payerEmail) {
        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .transactionAmount(pago.getMonto())
                .token(cardToken)
                .description(pago.getConcepto())
                .installments(1)
                .payer(PaymentPayerRequest.builder().email(payerEmail).build())
                .externalReference("pago-" + pago.getId())
                .build();

        try {
            return new PaymentClient().create(request);
        } catch (MPApiException e) {
            log.error("component=pasarela pagoId={} status=error httpStatus={} motivo=\"{}\"",
                    pago.getId(), e.getApiResponse().getStatusCode(), e.getApiResponse().getContent());
            throw new BusinessRuleException("Mercado Pago rechazo la solicitud: " + e.getApiResponse().getContent());
        } catch (MPException e) {
            log.error("component=pasarela pagoId={} status=error motivo=\"{}\"", pago.getId(), e.getMessage());
            throw new BusinessRuleException("Error al conectar con Mercado Pago: " + e.getMessage());
        }
    }

    private void registrarLog(Long idPago, String estadoMp, Payment resultado) {
        String payload = "{\"id\":" + resultado.getId()
                + ",\"status\":\"" + estadoMp
                + "\",\"status_detail\":\"" + resultado.getStatusDetail() + "\"}";
        try {
            pasarelaClient.registrar(idPago, PROVEEDOR, String.valueOf(resultado.getId()), estadoMp, payload);
        } catch (Exception e) {
            log.warn("component=pasarela pagoId={} status=log_failed motivo=\"{}\"", idPago, e.getMessage());
        }
    }
}
