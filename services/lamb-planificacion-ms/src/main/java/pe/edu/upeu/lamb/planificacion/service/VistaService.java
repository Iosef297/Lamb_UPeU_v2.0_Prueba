package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.dto.HorarioEstudianteResponse;
import pe.edu.upeu.lamb.planificacion.dto.OcurrenciaClaseResponse;
import pe.edu.upeu.lamb.planificacion.dto.OcurrenciasResponse;
import pe.edu.upeu.lamb.planificacion.entity.DiaNoLectivo;
import pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo;
import pe.edu.upeu.lamb.planificacion.entity.PeriodoAcademico;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.mapper.HorarioGrupoMapper;
import pe.edu.upeu.lamb.planificacion.repository.DiaNoLectivoRepository;
import pe.edu.upeu.lamb.planificacion.repository.HorarioGrupoRepository;
import pe.edu.upeu.lamb.planificacion.repository.PeriodoAcademicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VistaService {

    private static final int MAX_OCURRENCIAS = 3000;

    private final HorarioGrupoRepository horarioGrupoRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final DiaNoLectivoRepository diaNoLectivoRepository;
    private final pe.edu.upeu.lamb.planificacion.repository.AsignacionDocenteRepository asignacionDocenteRepository;
    private final pe.edu.upeu.lamb.planificacion.mapper.GrupoMapper grupoMapper;

    // Vista docente: grupos donde el docente (idPersona del JWT) esta asignado, con sus permisos en cada grupo
    @Transactional(readOnly = true)
    public List<pe.edu.upeu.lamb.planificacion.dto.GrupoResponse> misGrupos(Long idDocente, Long idPeriodo) {
        return asignacionDocenteRepository.findDelDocente(idDocente, idPeriodo).stream()
                .map(a -> grupoMapper.toResponse(a.getGrupo()))
                .toList();
    }

    // Horario del estudiante = bloques activos de sus grupos; cruce = dos bloques de grupos distintos que se pisan
    @Transactional(readOnly = true)
    public List<HorarioEstudianteResponse> horarioEstudiante(List<Long> idsGrupo) {
        List<HorarioGrupo> bloques = horarioGrupoRepository.findActivosDeGrupos(idsGrupo);
        return bloques.stream()
                .map(h -> HorarioEstudianteResponse.builder()
                        .idHorario(h.getId())
                        .diaSemana(h.getDiaSemana())
                        .horaInicio(h.getHoraInicio())
                        .horaFin(h.getHoraFin())
                        .idGrupo(h.getGrupo().getId())
                        .codigoGrupo(h.getGrupo().getCodigo())
                        .codigoCurso(h.getGrupo().getCurso().getCodigo())
                        .nombreCurso(h.getGrupo().getCurso().getNombre())
                        .codigoAmbiente(h.getAmbiente() == null ? "Por confirmar" : h.getAmbiente().getCodigo())
                        .etiquetaTipo(h.etiquetaTipo())
                        .rolDocente(h.getAsignacionDocente() == null ? null : HorarioGrupoMapper.nombreRol(h.getAsignacionDocente().getRol()))
                        .fechaInicio(h.getFechaInicio())
                        .fechaFin(h.getFechaFin())
                        .cruce(bloques.stream().anyMatch(o -> seCruzan(h, o)))
                        .build())
                .toList();
    }

    /**
     * Una fila por clase real entre desde y hasta (sin dias no lectivos), como schedule-detail del LAMB.
     * El rango de cada bloque es el suyo, o el del periodo si no tiene fechas.
     */
    @Transactional(readOnly = true)
    public OcurrenciasResponse ocurrencias(List<Long> idsGrupo, LocalDate desde, LocalDate hasta) {
        if (hasta.isBefore(desde)) {
            throw new BusinessRuleException("La fecha hasta no puede ser anterior a desde");
        }
        List<HorarioGrupo> bloques = horarioGrupoRepository.findActivosDeGrupos(idsGrupo);
        Map<Long, PeriodoAcademico> periodos = periodoAcademicoRepository.findAllById(
                bloques.stream().map(HorarioGrupo::getIdPeriodo).distinct().toList()).stream()
                .collect(Collectors.toMap(PeriodoAcademico::getId, Function.identity()));
        Set<LocalDate> noLectivos = diaNoLectivoRepository.findAll().stream().map(DiaNoLectivo::getFecha).collect(Collectors.toSet());

        List<OcurrenciaClaseResponse> clases = new ArrayList<>();
        for (HorarioGrupo h : bloques) {
            PeriodoAcademico periodo = periodos.get(h.getIdPeriodo());
            // Rango real del bloque (modulo o periodo): el front salta a esas fechas desde el chip "Horario"
            LocalDate inicioReal = h.getFechaInicio() != null ? h.getFechaInicio() : periodo == null ? null : periodo.getFechaInicio();
            LocalDate finReal = h.getFechaFin() != null ? h.getFechaFin() : periodo == null ? null : periodo.getFechaFin();
            LocalDate inicio = max(desde, inicioReal != null ? inicioReal : desde);
            LocalDate fin = min(hasta, finReal != null ? finReal : hasta);
            DayOfWeek dia = DayOfWeek.valueOf(diaIngles(h.getDiaSemana().name()));
            for (LocalDate f = inicio; !f.isAfter(fin); f = f.plusDays(1)) {
                if (f.getDayOfWeek() != dia || noLectivos.contains(f)) {
                    continue;
                }
                if (clases.size() >= MAX_OCURRENCIAS) {
                    throw new BusinessRuleException("Demasiadas clases en el rango pedido; acorta las fechas");
                }
                clases.add(OcurrenciaClaseResponse.builder()
                        .fechaHoraInicio(f.atTime(h.getHoraInicio()))
                        .fechaHoraFin(f.atTime(h.getHoraFin()))
                        .idGrupo(h.getGrupo().getId())
                        .codigoGrupo(h.getGrupo().getCodigo())
                        .nombreCurso(h.getGrupo().getCurso().getNombre())
                        .idHorario(h.getId())
                        .idAsignacionDocente(h.getAsignacionDocente() == null ? null : h.getAsignacionDocente().getId())
                        .etiquetaTipo(h.etiquetaTipo())
                        .codigoAmbiente(h.getAmbiente() == null ? "Por confirmar" : h.getAmbiente().getCodigo())
                        .idAmbiente(h.getAmbiente() == null ? null : h.getAmbiente().getId())
                        .idDocente(h.getAsignacionDocente() == null ? null : h.getAsignacionDocente().getIdDocente())
                        .nombreModulo(h.getModulo() == null ? null : h.getModulo().getNombre())
                        .moduloInicio(inicioReal)
                        .moduloFin(finReal)
                        .turno(pe.edu.upeu.lamb.planificacion.entity.Turno.de(h.getHoraInicio()))
                        .build());
            }
        }
        clases.sort(Comparator.comparing(OcurrenciaClaseResponse::getFechaHoraInicio));
        return OcurrenciasResponse.builder()
                .clases(clases)
                .minHoraInicio(bloques.stream().map(HorarioGrupo::getHoraInicio).min(LocalTime::compareTo).orElse(null))
                .maxHoraFin(bloques.stream().map(HorarioGrupo::getHoraFin).max(LocalTime::compareTo).orElse(null))
                .build();
    }

    private static boolean seCruzan(HorarioGrupo a, HorarioGrupo b) {
        return !a.getGrupo().getId().equals(b.getGrupo().getId())
                && a.getDiaSemana() == b.getDiaSemana()
                && a.getHoraInicio().isBefore(b.getHoraFin()) && b.getHoraInicio().isBefore(a.getHoraFin())
                && ReglasGrupoService.fechasSeCruzan(a.getFechaInicio(), a.getFechaFin(), b.getFechaInicio(), b.getFechaFin());
    }

    private static String diaIngles(String dia) {
        return switch (dia) {
            case "LUNES" -> "MONDAY";
            case "MARTES" -> "TUESDAY";
            case "MIERCOLES" -> "WEDNESDAY";
            case "JUEVES" -> "THURSDAY";
            case "VIERNES" -> "FRIDAY";
            case "SABADO" -> "SATURDAY";
            default -> "SUNDAY";
        };
    }

    private static LocalDate max(LocalDate a, LocalDate b) {
        return a.isAfter(b) ? a : b;
    }

    private static LocalDate min(LocalDate a, LocalDate b) {
        return a.isBefore(b) ? a : b;
    }
}
