package pe.edu.upeu.lamb.planificacion.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConformidadSilaboResponse {
    private Long id;
    private Long idGrupo;
    private String codigoGrupo;
    private Long idPersona;
    private LocalDateTime fecha;
}
