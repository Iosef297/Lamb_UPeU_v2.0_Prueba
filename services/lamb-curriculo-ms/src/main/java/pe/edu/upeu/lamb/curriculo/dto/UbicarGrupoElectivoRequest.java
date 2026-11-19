package pe.edu.upeu.lamb.curriculo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Pone un grupo de electivos en la malla: nombre que se vera ("Electivo I") y ciclo. */
@Getter
@Setter
public class UbicarGrupoElectivoRequest {

    @NotBlank
    @Size(max = 150)
    private String nombre;

    @NotNull
    @Min(1)
    @Max(14)
    private Integer ciclo;
}
