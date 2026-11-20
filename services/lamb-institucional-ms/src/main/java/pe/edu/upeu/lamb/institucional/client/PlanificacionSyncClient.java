package pe.edu.upeu.lamb.institucional.client;

import pe.edu.upeu.lamb.institucional.dto.SincronizarPeriodoRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Resuelve lamb-planificacion-ms por su nombre en Eureka, sin URL fija
@FeignClient(name = "lamb-planificacion-ms")
public interface PlanificacionSyncClient {

    @PostMapping("/api/v1/periodos-academicos/sync-institucional")
    void sincronizarPeriodo(@RequestBody SincronizarPeriodoRequest request);
}
