package pe.edu.upeu.lamb.finanzas.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Registra el log de la transaccion de pasarela en lamb-ingresos-pagos-ms, que es el
 * dueno de LogTransaccionPasarela (referencia cruzada por idPago, sin FK real entre servicios).
 */
@Component
@RequiredArgsConstructor
public class IngresosPagosPasarelaClient {

    private final RestClient ingresosPagosRestClient;

    public void registrar(Long idPago, String proveedor, String referenciaExterna, String estado, String payloadRespuesta) {
        ingresosPagosRestClient.post()
                .uri("/api/v1/logs-transaccion-pasarela")
                .body(Map.of(
                        "pagoId", idPago,
                        "proveedor", proveedor,
                        "referenciaExterna", referenciaExterna,
                        "estado", estado,
                        "payloadRespuesta", payloadRespuesta
                ))
                .retrieve()
                .toBodilessEntity();
    }
}
