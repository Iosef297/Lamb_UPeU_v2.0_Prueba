package pe.edu.upeu.lamb.planificacion.dto;

import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcurrenciasResponse {
    private List<OcurrenciaClaseResponse> clases;
    // Para dibujar el calendario sin franjas vacias
    private LocalTime minHoraInicio;
    private LocalTime maxHoraFin;
}
