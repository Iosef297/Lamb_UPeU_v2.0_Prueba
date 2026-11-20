package pe.edu.upeu.lamb.admision.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.upeu.lamb.admision.dto.PostulanteResponse;
import pe.edu.upeu.lamb.admision.entity.Postulante;
import pe.edu.upeu.lamb.admision.port.PersonaPort;

@Component
@RequiredArgsConstructor
public class PostulanteMapper {
    private final PersonaPort personaPort;

    public PostulanteResponse toResponse(Postulante p) {
        String nombreCompleto = personaPort.consultarPorId(p.getIdPersona())
                .map(PersonaPort.PersonaInfo::nombreCompleto)
                .orElse(null);
        return PostulanteResponse.builder()
                .id(p.getId())
                .idPersona(p.getIdPersona())
                .nombreCompleto(nombreCompleto)
                .idConvocatoria(p.getConvocatoria().getId())
                .codigoConvocatoria(p.getConvocatoria().getCodigo())
                .idExamen(p.getIdExamen())
                .idModalidad(p.getModalidad().getId())
                .codigoModalidad(p.getModalidad().getCodigo())
                .codigoPostulante(p.getCodigoPostulante())
                .colegioProcedencia(p.getColegioProcedencia())
                .anioEgresoColegio(p.getAnioEgresoColegio())
                .promedioColegio(p.getPromedioColegio())
                .telefonoContacto(p.getTelefonoContacto())
                .correoContacto(p.getCorreoContacto())
                .nombreApoderado(p.getNombreApoderado())
                .telefonoApoderado(p.getTelefonoApoderado())
                .estado(p.getEstado().name())
                .fechaRegistro(p.getFechaRegistro())
                .build();
    }
}
