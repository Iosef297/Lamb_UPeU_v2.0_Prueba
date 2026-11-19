package pe.edu.upeu.lamb.planificacion.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

// Fechas de pago (cronogramas de vencimiento) de lamb-finanzas-ms: en el LAMB son actividades "Fecha de pago"
@FeignClient(name = "lamb-finanzas-ms", contextId = "finanzasActividades")
public interface FinanzasClient {

    @GetMapping("/api/v1/calendario-planes/cronogramas-vencimiento")
    List<Map<String, Object>> cronogramasVencimiento();
}
