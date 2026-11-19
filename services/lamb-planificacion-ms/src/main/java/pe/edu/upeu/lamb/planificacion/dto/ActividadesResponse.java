package pe.edu.upeu.lamb.planificacion.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActividadesResponse {
    // "Regular 2026-2" (tipo de periodo + codigo)
    private String periodo;
    private int total;
    private List<ActividadResponse> actividades;
    // "Actividades generales": documento oficial del calendario (null si aun no se publico)
    private String urlDocumento;
    private String nombreArchivo;
    private String modoHorarioAlumno;
    // Microservicios que no respondieron (el calendario se muestra igual, sin esas actividades)
    private List<String> fuentesNoDisponibles;
}
