package pe.edu.upeu.lamb.planificacion.controller;

import pe.edu.upeu.lamb.planificacion.dto.ModuloPeriodoRequest;
import pe.edu.upeu.lamb.planificacion.dto.ModuloPeriodoResponse;
import pe.edu.upeu.lamb.planificacion.service.ModuloPeriodoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Modulo del periodo", description = "Regular / Modular del periodo: agrupa bloques de horario con sus fechas")
@RestController
@RequestMapping("/api/v1/modulos-periodo")
@RequiredArgsConstructor
public class ModuloPeriodoController {

    private final ModuloPeriodoService service;

    @GetMapping
    public List<ModuloPeriodoResponse> listar(@RequestParam(required = false) Long idPeriodo) {
        return service.listar(idPeriodo);
    }

    @GetMapping("/{id}")
    public ModuloPeriodoResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ModuloPeriodoResponse crear(@Valid @RequestBody ModuloPeriodoRequest request) {
        return service.crear(request);
    }

    @PutMapping("/{id}")
    public ModuloPeriodoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ModuloPeriodoRequest request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
