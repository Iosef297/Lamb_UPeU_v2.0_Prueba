package pe.edu.upeu.lamb.curriculo.dto;


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
public class CursoCatalogoResponse {
    private Long id;
    private String codigo;
    private String nombre;
    private Integer creditos;
    private Integer horasTeoria;
    private Integer horasPractica;
    private Integer horasNoPresenciales;
    private Integer horasAprendizajeAutonomo;
    private Integer creditosTeoria;
    private Integer creditosPractica;
    private Integer horasTotales;
    private Long idDepartamento;
    private Long idPrograma;
    private Long idModalidad;
    private String codigoModalidad;
}
