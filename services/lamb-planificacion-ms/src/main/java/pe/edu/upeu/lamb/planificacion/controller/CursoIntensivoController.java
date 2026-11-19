package pe.edu.upeu.lamb.planificacion.controller;

import pe.edu.upeu.lamb.planificacion.dto.CursoIntensivoRequest;
import pe.edu.upeu.lamb.planificacion.dto.CursoIntensivoResponse;
import pe.edu.upeu.lamb.planificacion.service.CursoIntensivoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Curso intensivo", description = "CRUD 11 · Curso intensivo de vacaciones para estudiantes que desaprobaron el curso")
@RestController
@RequestMapping("/api/v1/cursos-intensivos")
@RequiredArgsConstructor
public class CursoIntensivoController {

    private final CursoIntensivoService cursoIntensivoService;

    @GetMapping
    public List<CursoIntensivoResponse> listar(@RequestParam(required = false) Long idPeriodo) {
        return cursoIntensivoService.listar(idPeriodo);
    }

    @GetMapping("/{id}")
    public CursoIntensivoResponse obtener(@PathVariable Long id) {
        return cursoIntensivoService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CursoIntensivoResponse crear(@Valid @RequestBody CursoIntensivoRequest request) {
        return cursoIntensivoService.crear(request);
    }

    @PutMapping("/{id}")
    public CursoIntensivoResponse actualizar(@PathVariable Long id, @Valid @RequestBody CursoIntensivoRequest request) {
        return cursoIntensivoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        cursoIntensivoService.eliminar(id);
    }
}
