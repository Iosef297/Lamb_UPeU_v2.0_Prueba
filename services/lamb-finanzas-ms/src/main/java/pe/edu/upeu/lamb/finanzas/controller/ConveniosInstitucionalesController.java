package pe.edu.upeu.lamb.finanzas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.lamb.finanzas.dto.ConvenioInstitucionalDescuentoRequest;
import pe.edu.upeu.lamb.finanzas.dto.ConvenioInstitucionalDescuentoResponse;
import pe.edu.upeu.lamb.finanzas.service.ConvenioInstitucionalDescuentoService;

import java.util.List;

/**
 * Item 35 del documento: "Convenio institucional con descuento (Instituciones Adventistas)".
 * CRUD opcional: depende de la universidad.
 */
@RestController
@RequestMapping("/api/v1/convenios-institucionales")
@RequiredArgsConstructor
@Tag(name = "convenios-institucionales-controller")
public class ConveniosInstitucionalesController {

    private final ConvenioInstitucionalDescuentoService convenioInstitucionalDescuentoService;

    @GetMapping
    @Operation(summary = "Listar convenios institucionales con descuento")
    public List<ConvenioInstitucionalDescuentoResponse> listar() {
        return convenioInstitucionalDescuentoService.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un convenio institucional con descuento")
    public ConvenioInstitucionalDescuentoResponse obtener(@PathVariable Long id) {
        return convenioInstitucionalDescuentoService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un convenio institucional con descuento")
    public ConvenioInstitucionalDescuentoResponse crear(@Valid @RequestBody ConvenioInstitucionalDescuentoRequest request) {
        return convenioInstitucionalDescuentoService.crear(request);
    }
}
