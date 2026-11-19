package pe.edu.upeu.lamb.planificacion.controller;

import pe.edu.upeu.lamb.planificacion.dto.FranjaHorariaRequest;
import pe.edu.upeu.lamb.planificacion.dto.FranjaHorariaResponse;
import pe.edu.upeu.lamb.planificacion.service.FranjaHorariaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Franjas horarias", description = "Franjas pedagogicas fijas del LAMB (17 por dia)")
@RestController
@RequestMapping("/api/v1/franjas-horarias")
@RequiredArgsConstructor
public class FranjaHorariaController {

    private final FranjaHorariaService franjaHorariaService;

    @GetMapping
    public List<FranjaHorariaResponse> listar() {
        return franjaHorariaService.listar();
    }

    @GetMapping("/{id}")
    public FranjaHorariaResponse obtener(@PathVariable Long id) {
        return franjaHorariaService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FranjaHorariaResponse crear(@Valid @RequestBody FranjaHorariaRequest request) {
        return franjaHorariaService.crear(request);
    }

    @PutMapping("/{id}")
    public FranjaHorariaResponse actualizar(@PathVariable Long id, @Valid @RequestBody FranjaHorariaRequest request) {
        return franjaHorariaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        franjaHorariaService.eliminar(id);
    }
}
