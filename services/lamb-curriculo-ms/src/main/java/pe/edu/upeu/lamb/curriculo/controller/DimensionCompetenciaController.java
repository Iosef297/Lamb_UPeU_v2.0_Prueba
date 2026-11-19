package pe.edu.upeu.lamb.curriculo.controller;

import pe.edu.upeu.lamb.curriculo.dto.DimensionCompetenciaRequest;
import pe.edu.upeu.lamb.curriculo.dto.DimensionCompetenciaResponse;
import pe.edu.upeu.lamb.curriculo.service.DimensionCompetenciaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Dimension de competencia", description = "Dimensiones numeradas de la competencia general o especifica (silabo LAMB)")
@RestController
@RequestMapping("/api/v1/dimensiones-competencia")
@RequiredArgsConstructor
public class DimensionCompetenciaController {

    private final DimensionCompetenciaService service;

    @GetMapping
    public List<DimensionCompetenciaResponse> listar(@RequestParam(required = false) String tipoCompetencia,
                                                     @RequestParam(required = false) Long idCompetencia) {
        return service.listar(tipoCompetencia, idCompetencia);
    }

    @GetMapping("/{id}")
    public DimensionCompetenciaResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DimensionCompetenciaResponse crear(@Valid @RequestBody DimensionCompetenciaRequest request) {
        return service.crear(request);
    }

    @PutMapping("/{id}")
    public DimensionCompetenciaResponse actualizar(@PathVariable Long id, @Valid @RequestBody DimensionCompetenciaRequest request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
