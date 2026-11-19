package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.client.EvaluacionClient;
import pe.edu.upeu.lamb.planificacion.client.FinanzasClient;
import pe.edu.upeu.lamb.planificacion.dto.ActividadResponse;
import pe.edu.upeu.lamb.planificacion.dto.ActividadesResponse;
import pe.edu.upeu.lamb.planificacion.entity.CalendarioAcademico;
import pe.edu.upeu.lamb.planificacion.entity.DiaNoLectivo;
import pe.edu.upeu.lamb.planificacion.entity.EstadoHito;
import pe.edu.upeu.lamb.planificacion.entity.HitoCalendario;
import pe.edu.upeu.lamb.planificacion.entity.PeriodoAcademico;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.repository.CalendarioAcademicoRepository;
import pe.edu.upeu.lamb.planificacion.repository.DiaNoLectivoRepository;
import pe.edu.upeu.lamb.planificacion.repository.GrupoRepository;
import pe.edu.upeu.lamb.planificacion.repository.HitoCalendarioRepository;
import pe.edu.upeu.lamb.planificacion.repository.PeriodoAcademicoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * Calendario de actividades (A3): junta hitos y dias no lectivos (propios), evaluaciones programadas
 * (lamb-evaluacion-ms) y fechas de pago (lamb-finanzas-ms). Si un MS no responde, se muestra lo demas.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActividadesService {

    private static final Map<String, String> TIPO_HITO = Map.of(
            "MATRICULA", "Matricula", "INICIO_CLASES", "Inicio de clases", "EXAMEN_PARCIAL", "Examen parcial",
            "EXAMEN_FINAL", "Examen final", "CIERRE_NOTAS", "Cierre de notas", "FIN_CLASES", "Fin de clases", "OTRO", "Actividad");

    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final CalendarioAcademicoRepository calendarioAcademicoRepository;
    private final HitoCalendarioRepository hitoCalendarioRepository;
    private final DiaNoLectivoRepository diaNoLectivoRepository;
    private final GrupoRepository grupoRepository;
    private final EvaluacionClient evaluacionClient;
    private final FinanzasClient finanzasClient;

    @Transactional(readOnly = true)
    public ActividadesResponse actividades(Long idPeriodo, Long idPrograma, List<Long> idsGrupo, boolean soloAlumno, Integer anio) {
        PeriodoAcademico periodo = periodoAcademicoRepository.findById(idPeriodo)
                .orElseThrow(() -> new ResourceNotFoundException("Periodo academico no encontrado: " + idPeriodo));
        List<CalendarioAcademico> calendarios = calendarioAcademicoRepository.findAll().stream()
                .filter(c -> c.getPeriodo().getId().equals(idPeriodo))
                .toList();
        List<ActividadResponse> lista = new ArrayList<>();
        List<String> caidas = new ArrayList<>();

        for (CalendarioAcademico cal : calendarios) {
            agregarHitos(lista, cal, idPrograma, soloAlumno);
            for (DiaNoLectivo d : diaNoLectivoRepository.findByCalendarioId(cal.getId())) {
                lista.add(ActividadResponse.builder()
                        .origen("NO_LECTIVO").idOrigen(d.getId())
                        .tipo(d.getTipo() == null ? "No lectivo" : capital(d.getTipo().name()))
                        .titulo(d.getMotivo())
                        .area("ACADEMICO")
                        .alcance("Sede " + cal.getIdSede())
                        .fechaInicio(d.getFecha()).fechaFin(d.getFecha())
                        .build());
            }
        }

        // Evaluaciones programadas de los grupos pedidos (las del alumno o las del docente)
        if (idsGrupo != null && !idsGrupo.isEmpty()) {
            try {
                agregarEvaluaciones(lista, idsGrupo);
            } catch (RuntimeException ex) {
                log.warn("component=actividades fuente=lamb-evaluacion-ms status=unavailable error=\"{}\"", ex.getMessage());
                caidas.add("lamb-evaluacion-ms");
            }
        }

        // Fechas de pago del periodo
        try {
            agregarPagos(lista, periodo);
        } catch (RuntimeException ex) {
            log.warn("component=actividades fuente=lamb-finanzas-ms status=unavailable error=\"{}\"", ex.getMessage());
            caidas.add("lamb-finanzas-ms");
        }

        if (anio != null) {
            lista.removeIf(a -> a.getFechaInicio().getYear() != anio && a.getFechaFin().getYear() != anio);
        }
        lista.sort(Comparator.comparing(ActividadResponse::getFechaInicio).thenComparing(ActividadResponse::getTipo));

        CalendarioAcademico oficial = calendarios.stream()
                .filter(c -> c.getUrlDocumento() != null)
                .findFirst().orElse(calendarios.isEmpty() ? null : calendarios.get(0));
        return ActividadesResponse.builder()
                .periodo(periodo.getTipoPeriodo().getNombre() + " " + periodo.getCodigo())
                .total(lista.size())
                .actividades(lista)
                .urlDocumento(oficial == null ? null : oficial.getUrlDocumento())
                .nombreArchivo(oficial == null ? null : oficial.getNombreArchivo())
                .modoHorarioAlumno(oficial == null ? "HMC" : oficial.getModoHorarioAlumno())
                .fuentesNoDisponibles(caidas)
                .build();
    }

    // H11: configuracion institucional de como ve el alumno su horario
    @Transactional(readOnly = true)
    public Map<String, String> modoHorarioAlumno(Long idPeriodo) {
        String codigo = calendarioAcademicoRepository.findAll().stream()
                .filter(c -> idPeriodo == null || c.getPeriodo().getId().equals(idPeriodo))
                .map(CalendarioAcademico::getModoHorarioAlumno)
                .findFirst().orElse("HMC");
        return Map.of("codigo", codigo, "nombre", "HML".equals(codigo) ? "Ver horario en lista" : "Ver horario en el calendario");
    }

    private void agregarHitos(List<ActividadResponse> lista, CalendarioAcademico cal, Long idPrograma, boolean soloAlumno) {
        for (HitoCalendario h : hitoCalendarioRepository.findByCalendarioId(cal.getId())) {
            boolean visible = h.getEstado() == EstadoHito.PUBLICADO && Boolean.TRUE.equals(h.getVisibleAlumno());
            boolean aplica = idPrograma == null || h.getIdPrograma() == null || h.getIdPrograma().equals(idPrograma);
            if (h.getEstado() == EstadoHito.ANULADO || !aplica || (soloAlumno && !visible)) {
                continue;
            }
            lista.add(ActividadResponse.builder()
                    .origen("HITO").idOrigen(h.getId())
                    .tipo(TIPO_HITO.getOrDefault(h.getTipo().name(), h.getTipo().name()))
                    .titulo(h.getNombre())
                    .area(h.getAreaResponsable().name())
                    .descripcion(h.getDescripcion())
                    .alcance(h.getIdPrograma() == null ? "Sede " + cal.getIdSede() : "Programa " + h.getIdPrograma())
                    .estado(h.getEstado().name())
                    .fechaInicio(h.getFechaInicio()).fechaFin(h.getFechaFin())
                    .build());
        }
    }

    private void agregarEvaluaciones(List<ActividadResponse> lista, List<Long> idsGrupo) {
        for (Long idGrupo : idsGrupo) {
            String alcance = grupoRepository.findById(idGrupo)
                    .map(g -> g.getCurso().getCodigo() + " grupo " + g.getCodigo()).orElse("Grupo " + idGrupo);
            for (Map<String, Object> e : evaluacionClient.evaluacionesProgramadas(idGrupo)) {
                LocalDate fecha = fecha(e.get("fecha"));
                if (fecha == null) {
                    continue;
                }
                Object detalle = e.get("producto") != null ? e.get("producto") : e.get("unidad");
                lista.add(ActividadResponse.builder()
                        .origen("EVALUACION").idOrigen(numero(e.get("id")))
                        .tipo("Evaluacion")
                        .titulo(Objects.toString(e.get("descripcion"), "Evaluacion") + " - " + alcance)
                        .area("ACADEMICO")
                        .descripcion(detalle == null ? null : detalle.toString())
                        .alcance(alcance)
                        .fechaInicio(fecha).fechaFin(fecha)
                        .build());
            }
        }
    }

    private void agregarPagos(List<ActividadResponse> lista, PeriodoAcademico periodo) {
        for (Map<String, Object> c : finanzasClient.cronogramasVencimiento()) {
            LocalDate fecha = fecha(c.get("fechaVencimiento"));
            if (fecha == null || !periodo.getCodigo().equals(c.get("periodo"))) {
                continue;
            }
            lista.add(ActividadResponse.builder()
                    .origen("PAGO").idOrigen(numero(c.get("id")))
                    .tipo("Fecha de pago")
                    .titulo(Objects.toString(c.get("descripcion"), "Vencimiento de cuota"))
                    .area("FINANCIERO")
                    .descripcion("Finanzas alumnos")
                    .alcance("Periodo " + periodo.getCodigo())
                    .fechaInicio(fecha).fechaFin(fecha)
                    .build());
        }
    }

    private static LocalDate fecha(Object v) {
        if (v == null) {
            return null;
        }
        String s = v.toString();
        return s.length() >= 10 ? LocalDate.parse(s.substring(0, 10)) : null;
    }

    private static Long numero(Object v) {
        return v instanceof Number n ? n.longValue() : null;
    }

    private static String capital(String s) {
        String t = s.replace('_', ' ').toLowerCase(Locale.ROOT);
        return Character.toUpperCase(t.charAt(0)) + t.substring(1);
    }
}
