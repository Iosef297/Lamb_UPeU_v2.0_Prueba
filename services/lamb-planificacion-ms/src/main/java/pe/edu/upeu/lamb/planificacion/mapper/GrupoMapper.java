package pe.edu.upeu.lamb.planificacion.mapper;

import pe.edu.upeu.lamb.planificacion.dto.GrupoRequest;
import pe.edu.upeu.lamb.planificacion.dto.GrupoResponse;
import pe.edu.upeu.lamb.planificacion.entity.AsignacionDocente;
import pe.edu.upeu.lamb.planificacion.entity.Grupo;
import pe.edu.upeu.lamb.planificacion.entity.RolDocente;
import pe.edu.upeu.lamb.planificacion.event.GrupoAbiertoEvento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class GrupoMapper {

    private static final java.util.Map<pe.edu.upeu.lamb.planificacion.entity.DiaSemana, String> DIAS = java.util.Map.of(
            pe.edu.upeu.lamb.planificacion.entity.DiaSemana.LUNES, "Lun", pe.edu.upeu.lamb.planificacion.entity.DiaSemana.MARTES, "Mar", pe.edu.upeu.lamb.planificacion.entity.DiaSemana.MIERCOLES, "Mié",
            pe.edu.upeu.lamb.planificacion.entity.DiaSemana.JUEVES, "Jue", pe.edu.upeu.lamb.planificacion.entity.DiaSemana.VIERNES, "Vie", pe.edu.upeu.lamb.planificacion.entity.DiaSemana.SABADO, "Sáb",
            pe.edu.upeu.lamb.planificacion.entity.DiaSemana.DOMINGO, "Dom");


    private final CursoMapper cursoMapper;
    private final HorarioGrupoMapper horarioGrupoMapper;
    private final AsignacionDocenteMapper asignacionDocenteMapper;

    // Solo la cabecera: la oferta y los detalles los arma GrupoService dentro de la transaccion
    public Grupo toEntity(GrupoRequest request) {
        return Grupo.builder()
                .codigo(request.getCodigo().trim().toUpperCase())
                .cupoMaximo(request.getCupoMaximo())
                .ciclo(request.getCiclo())
                .build();
    }

    public GrupoResponse toResponse(Grupo grupo) {
        return GrupoResponse.builder()
                .id(grupo.getId())
                .codigo(grupo.getCodigo())
                .idOferta(grupo.getOferta().getId())
                .idPrograma(grupo.getOferta().getIdPrograma())
                .periodo(grupo.getPeriodo().getCodigo())
                .cupoMaximo(grupo.getCupoMaximo())
                .ciclo(grupo.getCiclo() != null ? grupo.getCiclo() : grupo.getOferta().getCiclo())
                .estado(grupo.getEstado())
                .motivo(grupo.getMotivo())
                .version(grupo.getVersion())
                .puedeEditarSilabo(grupo.getPuedeEditarSilabo())
                .idDelegado(grupo.getIdDelegado())
                .curso(cursoMapper.toResponse(grupo.getCurso()))
                .horarios(grupo.getHorarios().stream().map(horarioGrupoMapper::toResponse).toList())
                .horarioResumen(grupo.getHorarios().stream()
                        .filter(h -> Boolean.TRUE.equals(h.getActivo()))
                        .sorted(java.util.Comparator.comparing(pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo::getDiaSemana).thenComparing(pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo::getHoraInicio))
                        .map(h -> DIAS.get(h.getDiaSemana()) + " " + h.getHoraInicio().toString().substring(0, 5) + "–" + h.getHoraFin().toString().substring(0, 5))
                        .collect(java.util.stream.Collectors.joining(" · ")))
                .docentes(grupo.getDocentes().stream().map(asignacionDocenteMapper::toResponse).toList())
                .build();
    }

    public GrupoAbiertoEvento toGrupoAbiertoEvento(Grupo grupo, String tipoEvento, String origen) {
        Long idDocenteTitular = grupo.getDocentes().stream()
                .filter(d -> d.getRol() == RolDocente.TITULAR)
                .map(AsignacionDocente::getIdDocente)
                .findFirst()
                .orElse(null);
        return GrupoAbiertoEvento.builder()
                .tipoEvento(tipoEvento)
                .grupoId(grupo.getId())
                .codigoGrupo(grupo.getCodigo())
                .codigoCurso(grupo.getCurso().getCodigo())
                .periodo(grupo.getPeriodo().getCodigo())
                .idDocenteTitular(idDocenteTitular)
                .cupoMaximo(grupo.getCupoMaximo())
                .creditos(grupo.getCurso().getCreditos())
                .origen(origen)
                .timestamp(Instant.now().toEpochMilli())
                .docentes(grupo.getDocentes().stream()
                        .map(d -> GrupoAbiertoEvento.DocenteEvento.builder()
                                .idDocente(d.getIdDocente())
                                .rol(d.getRol().name())
                                .gestionaNota(d.getGestionaNota())
                                .gestionaAsistencia(d.getGestionaAsistencia())
                                .build())
                        .toList())
                .build();
    }
}
