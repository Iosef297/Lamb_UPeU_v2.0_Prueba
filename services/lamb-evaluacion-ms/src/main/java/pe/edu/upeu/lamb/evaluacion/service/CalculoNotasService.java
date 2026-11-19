package pe.edu.upeu.lamb.evaluacion.service;

import pe.edu.upeu.lamb.evaluacion.dto.ResumenCompetenciasResponse;
import pe.edu.upeu.lamb.evaluacion.entity.Acta;
import pe.edu.upeu.lamb.evaluacion.entity.ConfiguracionEvaluacion;
import pe.edu.upeu.lamb.evaluacion.entity.EscalaCalificacion;
import pe.edu.upeu.lamb.evaluacion.entity.EvaluacionProgramada;
import pe.edu.upeu.lamb.evaluacion.entity.ModoEvaluacion;
import pe.edu.upeu.lamb.evaluacion.entity.Nota;
import pe.edu.upeu.lamb.evaluacion.entity.TipoComponente;
import pe.edu.upeu.lamb.evaluacion.entity.TipoRedondeo;
import pe.edu.upeu.lamb.evaluacion.repository.ActaRepository;
import pe.edu.upeu.lamb.evaluacion.repository.ConfiguracionEvaluacionRepository;
import pe.edu.upeu.lamb.evaluacion.repository.EscalaCalificacionRepository;
import pe.edu.upeu.lamb.evaluacion.repository.EvaluacionProgramadaRepository;
import pe.edu.upeu.lamb.evaluacion.repository.NotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Nota final del curso: la usan el cierre del acta (acta.cerrada) y las vistas calculadas.
 *
 * Modo COMPETENCIA (LAMB real de la UPeU):
 *   ES = evaluacion de sesiones, EP = evaluacion del producto, ECG = competencia generica.
 *   Si el grupo programo evidencias con peso, cada tipo es el promedio ponderado de sus evidencias
 *   (evidencia sin nota = 0) y su peso es la suma de pesos de sus evidencias; si no, cada tipo es el
 *   promedio de sus notas y los pesos salen de la escala vigente (20/70/10).
 *   Si EP < umbral (12.5) la nota final es EP. Si no, NF = wES*ES + wEP*EP + wECG*ECG, y el peso de un
 *   tipo que el curso no tiene (ej. sin ECG), o el que falta para llegar a 100, pasa a EP: NF = 20%*ES + 80%*EP.
 *   Los examenes (tipo EXAMEN) cuentan como producto.
 *
 * Modo PONDERADO: promedio ponderado por componente (CRUD 2) o promedio simple sin pesos.
 */
@Service
@RequiredArgsConstructor
public class CalculoNotasService {

    // Escala vigesimal por defecto si aun no se registro ninguna escala vigente
    private static final EscalaCalificacion ESCALA_POR_DEFECTO = EscalaCalificacion.builder()
            .codigo("VIGESIMAL")
            .notaMinima(BigDecimal.ZERO)
            .notaMaxima(new BigDecimal("20"))
            .notaAprobatoria(new BigDecimal("10.5"))
            .decimales(2)
            .redondeo(TipoRedondeo.HALF_UP)
            .vigente(true)
            .umbralProducto(new BigDecimal("12.5"))
            .pesoSesiones(new BigDecimal("20"))
            .pesoProducto(new BigDecimal("70"))
            .pesoCompetenciaGenerica(new BigDecimal("10"))
            .build();

    private static final BigDecimal CIEN = new BigDecimal("100");

    /** Los tres bloques de la nota por competencias. */
    public enum Bloque { ES, EP, ECG }

    private final NotaRepository notaRepository;
    private final ConfiguracionEvaluacionRepository configuracionEvaluacionRepository;
    private final EscalaCalificacionRepository escalaCalificacionRepository;
    private final EvaluacionProgramadaRepository evaluacionProgramadaRepository;
    private final ActaRepository actaRepository;

    @Transactional(readOnly = true)
    public EscalaCalificacion escalaVigente() {
        return escalaCalificacionRepository.findFirstByVigenteTrue().orElse(ESCALA_POR_DEFECTO);
    }

    public boolean aprobado(BigDecimal notaFinal, EscalaCalificacion escala) {
        return notaFinal.compareTo(escala.getNotaAprobatoria()) >= 0;
    }

    @Transactional(readOnly = true)
    public ModoEvaluacion modoDelGrupo(Long idGrupo) {
        return actaRepository.findByIdGrupo(idGrupo).map(Acta::getModoEvaluacion).orElse(ModoEvaluacion.PONDERADO);
    }

    // idPersona -> nota final, ordenado por idPersona
    @Transactional(readOnly = true)
    public Map<Long, BigDecimal> notasFinales(Long idGrupo) {
        if (modoDelGrupo(idGrupo) == ModoEvaluacion.COMPETENCIA) {
            Map<Long, BigDecimal> finales = new TreeMap<>();
            resumenCompetencias(idGrupo).forEach(r -> finales.put(r.getIdPersona(), r.getNotaFinal()));
            return finales;
        }
        EscalaCalificacion escala = escalaVigente();
        Map<Long, BigDecimal> pesos = configuracionEvaluacionRepository.findByIdGrupo(idGrupo).stream()
                .collect(Collectors.toMap(c -> c.getComponente().getId(), ConfiguracionEvaluacion::getPeso));
        Map<Long, List<Nota>> porEstudiante = notaRepository.findByIdGrupo(idGrupo).stream()
                .collect(Collectors.groupingBy(Nota::getIdPersona, TreeMap::new, Collectors.toList()));
        Map<Long, BigDecimal> finales = new TreeMap<>();
        porEstudiante.forEach((idPersona, notas) -> finales.put(idPersona, calcularPonderado(notas, pesos, escala)));
        return finales;
    }

    /** Detalle ES / EP / ECG / NF de cada estudiante del grupo con la formula aplicada. */
    @Transactional(readOnly = true)
    public List<ResumenCompetenciasResponse> resumenCompetencias(Long idGrupo) {
        EscalaCalificacion escala = escalaVigente();
        RoundingMode modo = RoundingMode.valueOf(escala.getRedondeo().name());
        List<Nota> notas = notaRepository.findByIdGrupo(idGrupo);
        List<EvaluacionProgramada> evidencias = evaluacionProgramadaRepository.findByIdGrupo(idGrupo).stream()
                .filter(e -> e.getPeso() != null && e.getPeso().signum() > 0)
                .toList();

        // Peso de cada bloque y bloques que el curso realmente tiene
        Map<Bloque, BigDecimal> pesos = new EnumMap<>(Bloque.class);
        Map<Bloque, Boolean> presente = new EnumMap<>(Bloque.class);
        for (Bloque b : Bloque.values()) {
            pesos.put(b, BigDecimal.ZERO);
            presente.put(b, false);
        }
        if (!evidencias.isEmpty()) {
            evidencias.forEach(e -> {
                Bloque b = bloque(e.getComponente().getTipo());
                pesos.merge(b, e.getPeso(), BigDecimal::add);
                presente.put(b, true);
            });
        } else {
            pesos.put(Bloque.ES, escala.getPesoSesiones());
            pesos.put(Bloque.EP, escala.getPesoProducto());
            pesos.put(Bloque.ECG, escala.getPesoCompetenciaGenerica());
            notas.forEach(n -> presente.put(bloque(n.getComponente().getTipo()), true));
        }

        Map<Long, List<Nota>> porEstudiante = notas.stream()
                .collect(Collectors.groupingBy(Nota::getIdPersona, TreeMap::new, Collectors.toList()));
        return porEstudiante.entrySet().stream().map(e -> {
            List<Nota> propias = e.getValue();
            Map<Bloque, BigDecimal> promedio = new EnumMap<>(Bloque.class);
            for (Bloque b : Bloque.values()) {
                promedio.put(b, evidencias.isEmpty() ? promedioSimple(propias, b) : promedioEvidencias(propias, evidencias, b));
            }
            BigDecimal ep = promedio.get(Bloque.EP);
            BigDecimal notaFinal;
            String formula;
            if (ep.compareTo(escala.getUmbralProducto()) < 0) {
                notaFinal = ep.setScale(escala.getDecimales(), modo);
                formula = "EP < " + texto(escala.getUmbralProducto()) + ": NF = EP";
            } else {
                // El peso de un bloque que el curso no tiene se suma al producto
                BigDecimal wEs = presente.get(Bloque.ES) ? pesos.get(Bloque.ES) : BigDecimal.ZERO;
                BigDecimal wEcg = presente.get(Bloque.ECG) ? pesos.get(Bloque.ECG) : BigDecimal.ZERO;
                // Base 100: lo que falta (bloque ausente o sin programar) se suma al producto
                BigDecimal total = CIEN;
                BigDecimal wEp = total.subtract(wEs).subtract(wEcg);
                notaFinal = wEs.multiply(promedio.get(Bloque.ES))
                        .add(wEp.multiply(ep))
                        .add(wEcg.multiply(promedio.get(Bloque.ECG)))
                        .divide(total, escala.getDecimales(), modo);
                formula = "NF = " + porcentaje(wEs, total) + "·ES + " + porcentaje(wEp, total) + "·EP"
                        + (wEcg.signum() > 0 ? " + " + porcentaje(wEcg, total) + "·ECG" : "");
            }
            return ResumenCompetenciasResponse.builder()
                    .idPersona(e.getKey())
                    .es(promedio.get(Bloque.ES).setScale(2, RoundingMode.HALF_UP))
                    .ep(ep.setScale(2, RoundingMode.HALF_UP))
                    .ecg(presente.get(Bloque.ECG) ? promedio.get(Bloque.ECG).setScale(2, RoundingMode.HALF_UP) : null)
                    .notaFinal(notaFinal)
                    .aprobado(aprobado(notaFinal, escala))
                    .formula(formula)
                    .build();
        }).toList();
    }

    /**
     * Antes de cerrar el acta los pesos configurados deben sumar exactamente 100 %:
     * evidencias programadas (modo competencia) o pesos por componente (modo ponderado).
     * Sin pesos configurados se usan los de la escala o el promedio simple, que ya estan completos.
     */
    @Transactional(readOnly = true)
    public void validarPesosCompletos(Long idGrupo) {
        BigDecimal suma;
        String que;
        if (modoDelGrupo(idGrupo) == ModoEvaluacion.COMPETENCIA) {
            suma = evaluacionProgramadaRepository.findByIdGrupo(idGrupo).stream()
                    .map(EvaluacionProgramada::getPeso).filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            que = "las evaluaciones programadas";
        } else {
            suma = configuracionEvaluacionRepository.findByIdGrupo(idGrupo).stream()
                    .map(ConfiguracionEvaluacion::getPeso)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            que = "los pesos por componente";
        }
        if (suma.signum() > 0 && suma.compareTo(CIEN) != 0) {
            throw new pe.edu.upeu.lamb.evaluacion.exception.BusinessRuleException("No se puede cerrar el acta: "
                    + que + " del grupo " + idGrupo + " suman " + texto(suma) + " % y deben sumar 100 %");
        }
    }

    public static Bloque bloque(TipoComponente tipo) {
        return switch (tipo) {
            case EVALUACION_SESIONES -> Bloque.ES;
            case EVALUACION_COMPETENCIA_GENERICA -> Bloque.ECG;
            case EVALUACION_PRODUCTO, EXAMEN -> Bloque.EP;
        };
    }

    // Sin evidencias programadas: promedio simple de las notas del bloque
    private BigDecimal promedioSimple(List<Nota> notas, Bloque b) {
        List<BigDecimal> del = notas.stream()
                .filter(n -> bloque(n.getComponente().getTipo()) == b)
                .map(Nota::getCalificacion)
                .toList();
        return del.isEmpty() ? BigDecimal.ZERO
                : del.stream().reduce(BigDecimal.ZERO, BigDecimal::add).divide(BigDecimal.valueOf(del.size()), 4, RoundingMode.HALF_UP);
    }

    // Con evidencias: promedio ponderado por el peso de cada evidencia del bloque; sin nota cuenta 0
    private BigDecimal promedioEvidencias(List<Nota> notas, List<EvaluacionProgramada> evidencias, Bloque b) {
        BigDecimal acumulado = BigDecimal.ZERO;
        BigDecimal pesoTotal = BigDecimal.ZERO;
        for (EvaluacionProgramada ev : evidencias) {
            if (bloque(ev.getComponente().getTipo()) != b) {
                continue;
            }
            List<BigDecimal> deLaEvidencia = notas.stream()
                    .filter(n -> Objects.equals(n.getIdEvaluacionProgramada(), ev.getId()))
                    .map(Nota::getCalificacion)
                    .toList();
            BigDecimal nota = deLaEvidencia.isEmpty() ? BigDecimal.ZERO
                    : deLaEvidencia.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(deLaEvidencia.size()), 4, RoundingMode.HALF_UP);
            acumulado = acumulado.add(nota.multiply(ev.getPeso()));
            pesoTotal = pesoTotal.add(ev.getPeso());
        }
        return pesoTotal.signum() == 0 ? BigDecimal.ZERO : acumulado.divide(pesoTotal, 4, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularPonderado(List<Nota> notas, Map<Long, BigDecimal> pesos, EscalaCalificacion escala) {
        RoundingMode modo = RoundingMode.valueOf(escala.getRedondeo().name());
        if (pesos.isEmpty()) {
            BigDecimal suma = notas.stream().map(Nota::getCalificacion).reduce(BigDecimal.ZERO, BigDecimal::add);
            return suma.divide(BigDecimal.valueOf(notas.size()), escala.getDecimales(), modo);
        }
        // Varias notas del mismo componente se promedian primero; luego se pondera por el peso del componente
        Map<Long, List<Nota>> porComponente = notas.stream()
                .collect(Collectors.groupingBy(n -> n.getComponente().getId()));
        BigDecimal acumulado = BigDecimal.ZERO;
        BigDecimal pesoTotal = BigDecimal.ZERO;
        for (Map.Entry<Long, BigDecimal> peso : pesos.entrySet()) {
            List<Nota> delComponente = porComponente.getOrDefault(peso.getKey(), List.of());
            BigDecimal promedio = delComponente.isEmpty()
                    ? BigDecimal.ZERO
                    : delComponente.stream().map(Nota::getCalificacion).reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(delComponente.size()), 4, RoundingMode.HALF_UP);
            acumulado = acumulado.add(promedio.multiply(peso.getValue()));
            pesoTotal = pesoTotal.add(peso.getValue());
        }
        return acumulado.divide(pesoTotal, escala.getDecimales(), modo);
    }

    private static String porcentaje(BigDecimal peso, BigDecimal total) {
        return texto(peso.multiply(CIEN).divide(total, 2, RoundingMode.HALF_UP)) + "%";
    }

    private static String texto(BigDecimal v) {
        return v.stripTrailingZeros().toPlainString();
    }
}
