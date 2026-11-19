package pe.edu.upeu.lamb.planificacion.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

// Evaluaciones programadas de un grupo (fecha, descripcion) para el calendario de actividades
@FeignClient(name = "lamb-evaluacion-ms", contextId = "evaluacionActividades")
public interface EvaluacionClient {

    @GetMapping("/api/v1/evaluaciones-programadas")
    List<Map<String, Object>> evaluacionesProgramadas(@RequestParam("idGrupo") Long idGrupo);
}
