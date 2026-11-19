package pe.edu.upeu.lamb.evaluacion.service;

import pe.edu.upeu.lamb.evaluacion.dto.DesaprobadosCursoResponse;
import pe.edu.upeu.lamb.evaluacion.entity.Acta;
import pe.edu.upeu.lamb.evaluacion.entity.EscalaCalificacion;
import pe.edu.upeu.lamb.evaluacion.entity.EstadoActa;
import pe.edu.upeu.lamb.evaluacion.repository.ActaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Quienes desaprobaron un curso y aun no lo aprobaron (demanda para un curso intensivo de vacaciones).
 * Se cuentan personas, no matriculas, y de cualquier carrera: el curso se identifica por su codigo y los
 * codigos de sus cursos equivalentes. Solo cuentan actas CERRADAS (notas finales ya publicadas).
 */
@Service
@RequiredArgsConstructor
public class RepitenciaService {

    private final ActaRepository actaRepository;
    private final CalculoNotasService calculoNotasService;

    @Transactional(readOnly = true)
    public DesaprobadosCursoResponse desaprobados(List<String> codigos) {
        List<String> limpios = codigos.stream().map(c -> c.trim().toUpperCase()).filter(c -> !c.isEmpty()).distinct().toList();
        List<Acta> actas = actaRepository.findByCodigoCursoInAndEstado(limpios, EstadoActa.CERRADA).stream()
                .sorted(Comparator.comparing(Acta::getPeriodo).thenComparing(Acta::getId))
                .toList();
        EscalaCalificacion escala = calculoNotasService.escalaVigente();

        Map<Long, DesaprobadosCursoResponse.Estudiante> ultimo = new LinkedHashMap<>();
        Set<Long> yaAprobaron = new HashSet<>();
        for (Acta acta : actas) {
            Map<Long, BigDecimal> finales = calculoNotasService.notasFinales(acta.getIdGrupo());
            for (Map.Entry<Long, BigDecimal> e : finales.entrySet()) {
                Long persona = e.getKey();
                if (calculoNotasService.aprobado(e.getValue(), escala)) {
                    yaAprobaron.add(persona);
                }
                DesaprobadosCursoResponse.Estudiante previo = ultimo.get(persona);
                ultimo.put(persona, DesaprobadosCursoResponse.Estudiante.builder()
                        .idPersona(persona)
                        .codigoCurso(acta.getCodigoCurso())
                        .periodo(acta.getPeriodo())
                        .notaFinal(e.getValue())
                        .intentos(previo == null ? 1 : previo.getIntentos() + 1)
                        .build());
            }
        }
        List<DesaprobadosCursoResponse.Estudiante> pendientes = ultimo.values().stream()
                .filter(est -> !yaAprobaron.contains(est.getIdPersona()))
                .toList();
        return DesaprobadosCursoResponse.builder()
                .codigos(limpios)
                .desaprobados(pendientes.size())
                .estudiantes(pendientes)
                .build();
    }
}
