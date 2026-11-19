package pe.edu.upeu.lamb.planificacion.mapper;

import pe.edu.upeu.lamb.planificacion.dto.HorarioGrupoResponse;
import pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo;
import org.springframework.stereotype.Component;

@Component
public class HorarioGrupoMapper {

    public HorarioGrupoResponse toResponse(HorarioGrupo horario) {
        return HorarioGrupoResponse.builder()
                .id(horario.getId())
                .idGrupo(horario.getGrupo().getId())
                .codigoGrupo(horario.getGrupo().getCodigo())
                .idAmbiente(horario.getAmbiente() == null ? null : horario.getAmbiente().getId())
                .codigoAmbiente(horario.getAmbiente() == null ? "Por confirmar" : horario.getAmbiente().getCodigo())
                .diaSemana(horario.getDiaSemana())
                .horaInicio(horario.getHoraInicio())
                .horaFin(horario.getHoraFin())
                .activo(horario.getActivo())
                .fechaInicio(horario.getFechaInicio())
                .fechaFin(horario.getFechaFin())
                .tipoHorario(horario.getTipoHorario())
                .numeroSubgrupo(horario.getNumeroSubgrupo())
                .codigoTipo(horario.codigoTipo())
                .etiquetaTipo(horario.etiquetaTipo())
                .idAsignacionDocente(horario.getAsignacionDocente() == null ? null : horario.getAsignacionDocente().getId())
                .idDocente(horario.getAsignacionDocente() == null ? null : horario.getAsignacionDocente().getIdDocente())
                .rolDocente(horario.getAsignacionDocente() == null ? null : nombreRol(horario.getAsignacionDocente().getRol()))
                .idModulo(horario.getModulo() == null ? null : horario.getModulo().getId())
                .nombreModulo(horario.getModulo() == null ? null : horario.getModulo().getNombre())
                .turno(pe.edu.upeu.lamb.planificacion.entity.Turno.de(horario.getHoraInicio()))
                .build();
    }

    /** Nombre del rol como lo muestra el LAMB. */
    public static String nombreRol(pe.edu.upeu.lamb.planificacion.entity.RolDocente rol) {
        return switch (rol) {
            case TITULAR -> "Docente Titular";
            case PRACTICA -> "Docente Jefe de práctica";
            case APOYO -> "Docente de apoyo";
        };
    }
}
