package pe.edu.upeu.lamb.planificacion.dto;

import pe.edu.upeu.lamb.planificacion.entity.EstadoCalendario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CalendarioAcademicoRequest {

    @NotNull
    private Long idPeriodo;

    @NotNull
    private Long idSede;

    @NotBlank
    @Size(max = 150)
    private String nombre;

    @Size(max = 50)
    private String resolucion;

    @NotNull
    private EstadoCalendario estado;

    @Size(max = 500)
    @jakarta.validation.constraints.Pattern(regexp = "^(https?://.+)?$", message = "debe ser una URL http(s)")
    private String urlDocumento;

    @Size(max = 150)
    private String nombreArchivo;

    @jakarta.validation.constraints.Pattern(regexp = "HMC|HML", message = "HMC (calendario) o HML (lista)")
    private String modoHorarioAlumno;
}
