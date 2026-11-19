package pe.edu.upeu.lamb.planificacion.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConformidadSilaboRequest {

    @NotNull
    private Long idGrupo;

    @NotNull
    private Long idPersona;
}
