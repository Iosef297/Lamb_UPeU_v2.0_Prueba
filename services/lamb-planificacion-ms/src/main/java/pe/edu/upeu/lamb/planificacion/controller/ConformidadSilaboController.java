package pe.edu.upeu.lamb.planificacion.controller;

import pe.edu.upeu.lamb.planificacion.dto.ConformidadSilaboRequest;
import pe.edu.upeu.lamb.planificacion.dto.ConformidadSilaboResponse;
import pe.edu.upeu.lamb.planificacion.service.ConformidadSilaboService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Conformidad del silabo", description = "Constancia del estudiante de haber recibido el silabo del grupo")
@RestController
@RequestMapping("/api/v1/conformidades-silabo")
@RequiredArgsConstructor
public class ConformidadSilaboController {

    private final ConformidadSilaboService service;

    @GetMapping
    public List<ConformidadSilaboResponse> listar(@RequestParam(required = false) Long idGrupo) {
        return service.listar(idGrupo);
    }

    @GetMapping("/{id}")
    public ConformidadSilaboResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConformidadSilaboResponse crear(@Valid @RequestBody ConformidadSilaboRequest request) {
        return service.crear(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
