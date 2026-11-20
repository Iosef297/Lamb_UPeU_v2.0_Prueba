package pe.edu.upeu.lamb.matricula.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModalidadMatriculaRequest {

    @NotBlank
    @Size(max = 20)
    private String codigo;

    @NotBlank
    @Size(max = 80)
    private String nombre;

    @Size(max = 255)
    private String descripcion;

    @NotNull
    private Boolean activo;

    private Long idModalidadEstudio;

    @Size(max = 40)
    private String articuloLegal;

    private Integer creditosMinimos;

    @NotNull
    private Boolean requierePago;

    private Integer diasHabilesLimite;

    private Integer maxVecesDesaprobado;
}
