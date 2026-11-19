package pe.edu.upeu.lamb.planificacion.controller;

import pe.edu.upeu.lamb.planificacion.dto.HorarioEstudianteResponse;
import pe.edu.upeu.lamb.planificacion.service.VistaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Vistas calculadas: solo lectura, se arman con datos de otros CRUD y no tienen tabla propia
@Tag(name = "Vistas", description = "Vistas calculadas de planificacion (solo lectura)")
@RestController
@RequestMapping("/api/v1/vistas")
@RequiredArgsConstructor
public class VistaController {

    private final VistaService vistaService;

    private final pe.edu.upeu.lamb.planificacion.service.ActividadesService actividadesService;

    // Calendario de actividades: hitos + dias no lectivos + evaluaciones de los grupos + fechas de pago
    @GetMapping("/actividades")
    public pe.edu.upeu.lamb.planificacion.dto.ActividadesResponse actividades(@RequestParam Long idPeriodo,
                                                                         @RequestParam(required = false) Long idPrograma,
                                                                         @RequestParam(required = false) List<Long> idsGrupo,
                                                                         @RequestParam(defaultValue = "false") boolean soloAlumno,
                                                                         @RequestParam(required = false) Integer anio) {
        return actividadesService.actividades(idPeriodo, idPrograma, idsGrupo, soloAlumno, anio);
    }

    // Configuracion institucional: como ve el alumno su horario (HMC = en el calendario)
    @GetMapping("/modo-horario-alumno")
    public java.util.Map<String, String> modoHorarioAlumno(@RequestParam(required = false) Long idPeriodo) {
        return actividadesService.modoHorarioAlumno(idPeriodo);
    }

    // Vista docente: el docente sale del JWT (claim idPersona), no de la URL
    @GetMapping("/mis-grupos")
    public List<pe.edu.upeu.lamb.planificacion.dto.GrupoResponse> misGrupos(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt,
            @RequestParam(required = false) Long idPeriodo) {
        return vistaService.misGrupos(pe.edu.upeu.lamb.planificacion.config.JwtClaims.idPersona(jwt), idPeriodo);
    }

    // FUSION: hoy recibe los grupos del estudiante; al fusionar, obtenerlos de lamb-matricula-ms por el idPersona del JWT
    @GetMapping("/horario-estudiante")
    public List<HorarioEstudianteResponse> horarioEstudiante(@RequestParam List<Long> idsGrupo) {
        return vistaService.horarioEstudiante(idsGrupo);
    }

    // Clases reales (fecha y hora) de los grupos entre dos fechas, sin dias no lectivos
    @GetMapping("/horario-estudiante/ocurrencias")
    public pe.edu.upeu.lamb.planificacion.dto.OcurrenciasResponse ocurrencias(@RequestParam List<Long> idsGrupo,
                                                         @RequestParam java.time.LocalDate desde,
                                                         @RequestParam java.time.LocalDate hasta) {
        return vistaService.ocurrencias(idsGrupo, desde, hasta);
    }
}
