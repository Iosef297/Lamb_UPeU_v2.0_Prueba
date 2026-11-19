package pe.edu.upeu.lamb.planificacion.mapper;

import pe.edu.upeu.lamb.planificacion.dto.SesionClaseRequest;
import pe.edu.upeu.lamb.planificacion.dto.SesionClaseResponse;
import pe.edu.upeu.lamb.planificacion.entity.SesionClase;
import org.springframework.stereotype.Component;

@Component
public class SesionClaseMapper {

    // Las relaciones (ids de otras tablas) las resuelve el servicio
    public SesionClase toEntity(SesionClaseRequest request) {
        return SesionClase.builder()
                .numero(request.getNumero())
                .semana(request.getSemana())
                .tema(request.getTema().trim())
                .idUnidadAprendizaje(request.getIdUnidadAprendizaje())
                .actividades(request.getActividades())
                .tipoSesion(request.getTipoSesion())
                .fecha(request.getFecha())
                .horasTeoria(request.getHorasTeoria())
                .horasPractica(request.getHorasPractica())
                .horasAutonomas(request.getHorasAutonomas())
                .actividadPractica(request.getActividadPractica())
                .actividadAutonoma(request.getActividadAutonoma())
                .evidencia(request.getEvidencia())
                .instrumentos(request.getInstrumentos())
                .actividadSincrona(request.getActividadSincrona())
                .actividadAsincrona(request.getActividadAsincrona())
                .adjuntoUrl(request.getAdjuntoUrl())
                .build();
    }

    public SesionClaseResponse toResponse(SesionClase sesionClase) {
        return SesionClaseResponse.builder()
                .id(sesionClase.getId())
                .idSilabo(sesionClase.getSilabo().getId())
                .numero(sesionClase.getNumero())
                .semana(sesionClase.getSemana())
                .tema(sesionClase.getTema())
                .idUnidadAprendizaje(sesionClase.getIdUnidadAprendizaje())
                .actividades(sesionClase.getActividades())
                .tipoSesion(sesionClase.getTipoSesion())
                .fecha(sesionClase.getFecha())
                .horasTeoria(sesionClase.getHorasTeoria())
                .horasPractica(sesionClase.getHorasPractica())
                .horasAutonomas(sesionClase.getHorasAutonomas())
                .actividadPractica(sesionClase.getActividadPractica())
                .actividadAutonoma(sesionClase.getActividadAutonoma())
                .evidencia(sesionClase.getEvidencia())
                .instrumentos(sesionClase.getInstrumentos())
                .actividadSincrona(sesionClase.getActividadSincrona())
                .actividadAsincrona(sesionClase.getActividadAsincrona())
                .adjuntoUrl(sesionClase.getAdjuntoUrl())
                .build();
    }
}
