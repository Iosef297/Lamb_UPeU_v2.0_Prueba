package pe.edu.upeu.ingresospagos.controller;

import pe.edu.upeu.ingresospagos.dto.PageResponse;
import pe.edu.upeu.ingresospagos.util.PageUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.ingresospagos.dto.PagoConceptoRequest;
import pe.edu.upeu.ingresospagos.dto.PagoConceptoResponse;
import pe.edu.upeu.ingresospagos.service.PagoConceptoService;

@RestController
@RequestMapping("/api/v1/pagos-concepto")
@RequiredArgsConstructor
public class PagoConceptoController {

    private final PagoConceptoService pagoConceptoService;

    @GetMapping
    public PageResponse<PagoConceptoResponse> listar(
        @RequestParam(required = false) String idEstudiante,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        var items = idEstudiante == null
            ? pagoConceptoService.listar()
            : pagoConceptoService.listarPorEstudiante(idEstudiante);
        return PageUtil.paginate(items, page, size);
    }

    @GetMapping("/{id}")
    public PagoConceptoResponse obtener(@PathVariable Long id) {
        return pagoConceptoService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PagoConceptoResponse crear(@Valid @RequestBody PagoConceptoRequest request) {
        return pagoConceptoService.crear(request);
    }

    @PutMapping("/{id}")
    public PagoConceptoResponse actualizar(@PathVariable Long id, @Valid @RequestBody PagoConceptoRequest request) {
        return pagoConceptoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        pagoConceptoService.eliminar(id);
    }
}
