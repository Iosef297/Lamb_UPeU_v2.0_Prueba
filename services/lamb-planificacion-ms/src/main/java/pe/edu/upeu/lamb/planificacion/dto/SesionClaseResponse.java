package pe.edu.upeu.lamb.planificacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SesionClaseResponse {
    private Long id;
    private Long idSilabo;
    private Integer numero;
    private Integer semana;
    private String tema;
    private Long idUnidadAprendizaje;
    private String actividades;
    private String tipoSesion;
    private java.time.LocalDate fecha;
    private Integer horasTeoria;
    private Integer horasPractica;
    private Integer horasAutonomas;
    private String actividadPractica;
    private String actividadAutonoma;
    private String evidencia;
    private String instrumentos;
    private String actividadSincrona;
    private String actividadAsincrona;
    private String adjuntoUrl;
}
