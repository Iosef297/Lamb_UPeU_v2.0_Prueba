package pe.edu.upeu.lamb.institucional.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pe.edu.upeu.lamb.institucional.client.PlanificacionSyncClient;
import pe.edu.upeu.lamb.institucional.dto.RegimenAcademicoRequest;
import pe.edu.upeu.lamb.institucional.dto.RegimenAcademicoResponse;
import pe.edu.upeu.lamb.institucional.dto.SincronizarPeriodoRequest;
import pe.edu.upeu.lamb.institucional.entity.AnioAcademico;
import pe.edu.upeu.lamb.institucional.entity.PeriodoAcademico;
import pe.edu.upeu.lamb.institucional.entity.RegimenAcademico;
import pe.edu.upeu.lamb.institucional.entity.TipoPeriodo;
import pe.edu.upeu.lamb.institucional.exception.BusinessRuleException;
import pe.edu.upeu.lamb.institucional.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.institucional.mapper.RegimenAcademicoMapper;
import pe.edu.upeu.lamb.institucional.repository.AnioAcademicoRepository;
import pe.edu.upeu.lamb.institucional.repository.PeriodoAcademicoRepository;
import pe.edu.upeu.lamb.institucional.repository.RegimenAcademicoRepository;
import pe.edu.upeu.lamb.institucional.repository.TipoPeriodoRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class RegimenAcademicoService {

    private static final Logger log = LoggerFactory.getLogger(RegimenAcademicoService.class);

    private static final String[] NUMERALES_ROMANOS = {
            "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
    };

    private final RegimenAcademicoRepository regimenAcademicoRepository;
    private final RegimenAcademicoMapper regimenAcademicoMapper;
    private final AnioAcademicoRepository anioAcademicoRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final TipoPeriodoRepository tipoPeriodoRepository;
    private final PlanificacionSyncClient planificacionSyncClient;

    public List<RegimenAcademicoResponse> listar() {
        return regimenAcademicoRepository.findAll().stream()
                .map(regimenAcademicoMapper::toResponse)
                .toList();
    }

    public RegimenAcademicoResponse obtener(Long id) {
        return regimenAcademicoMapper.toResponse(buscarOFallar(id));
    }

    public RegimenAcademicoResponse crear(RegimenAcademicoRequest request) {
        RegimenAcademico entity = regimenAcademicoMapper.toEntity(request);
        RegimenAcademico guardado = regimenAcademicoRepository.save(entity);
        generarPeriodos(guardado);
        return regimenAcademicoMapper.toResponse(guardado);
    }

    public RegimenAcademicoResponse actualizar(Long id, RegimenAcademicoRequest request) {
        RegimenAcademico existente = buscarOFallar(id);
        RegimenAcademico entity = regimenAcademicoMapper.toEntity(request);
        RegimenAcademico guardado = regimenAcademicoRepository.save(Actualizacion.copiar(entity, existente));
        generarPeriodos(guardado);
        return regimenAcademicoMapper.toResponse(guardado);
    }

    public void eliminar(Long id) {
        periodoAcademicoRepository.deleteByIdRegimenAcademico(id);
        regimenAcademicoRepository.delete(buscarOFallar(id));
    }

    /**
     * Genera los periodos academicos (Nombre-I, Nombre-II, ...) del regimen segun
     * "periodos por anio". Se reemplazan los periodos previamente generados por
     * este regimen cada vez que se crea/actualiza.
     */
    private void generarPeriodos(RegimenAcademico regimen) {
        periodoAcademicoRepository.deleteByIdRegimenAcademico(regimen.getId());

        Integer cantidad = regimen.getPeriodosPorAnio();
        if (cantidad == null || cantidad <= 0) {
            return;
        }
        if (cantidad > NUMERALES_ROMANOS.length) {
            throw new BusinessRuleException("Periodos por anio no puede ser mayor a " + NUMERALES_ROMANOS.length);
        }
        if (regimen.getIdTipoPeriodo() == null) {
            throw new BusinessRuleException("Debe seleccionar un tipo de periodo para generar los periodos automaticamente");
        }

        // El anio se deriva de la fecha de inicio del regimen (si existe); el campo "anio"
        // manual queda solo como respaldo cuando no hay fecha de inicio.
        if (regimen.getFechaInicio() != null) {
            Integer anioDerivado = regimen.getFechaInicio().getYear();
            if (!anioDerivado.equals(regimen.getAnio())) {
                regimen.setAnio(anioDerivado);
                regimenAcademicoRepository.save(regimen);
            }
        }
        if (regimen.getAnio() == null) {
            throw new BusinessRuleException("Debe indicar la fecha de inicio (o el anio) del regimen para generar los periodos automaticamente");
        }

        Long idAnioAcademico = obtenerOCrearAnioAcademico(regimen.getAnio());
        LocalDate[][] rangos = dividirRango(regimen.getFechaInicio(), regimen.getFechaFin(), cantidad);
        TipoPeriodo tipoPeriodo = tipoPeriodoRepository.findById(regimen.getIdTipoPeriodo()).orElse(null);

        for (int i = 1; i <= cantidad; i++) {
            String nombre = regimen.getNombre() + "-" + NUMERALES_ROMANOS[i - 1];
            PeriodoAcademico.PeriodoAcademicoBuilder periodo = PeriodoAcademico.builder()
                    .nombre(nombre)
                    .idAnioAcademico(idAnioAcademico)
                    .idTipoPeriodo(regimen.getIdTipoPeriodo())
                    .idRegimenAcademico(regimen.getId());
            if (rangos != null) {
                periodo.fechaInicio(rangos[i - 1][0]).fechaFin(rangos[i - 1][1]);
            }
            periodoAcademicoRepository.save(periodo.build());

            if (rangos != null && tipoPeriodo != null) {
                sincronizarConPlanificacion(regimen, nombre, NUMERALES_ROMANOS[i - 1], tipoPeriodo,
                        rangos[i - 1][0], rangos[i - 1][1]);
            }
        }
    }

    /**
     * Espeja este periodo en lamb-planificacion-ms (su propia tabla operativa de periodos)
     * para que aparezca en los selectores de ese modulo sin tener que crearlo a mano ahi.
     * Best-effort: si planificacion no responde, no debe romper la creacion del regimen.
     * Los "codigo" se arman cortos (regimen.id + numeral) porque esa columna es VARCHAR(20)
     * en planificacion, sin importar que tan largo sea el nombre del regimen/tipo de periodo.
     */
    private void sincronizarConPlanificacion(RegimenAcademico regimen, String nombrePeriodo, String numeral,
                                              TipoPeriodo tipoPeriodo, LocalDate fechaInicio, LocalDate fechaFin) {
        try {
            SincronizarPeriodoRequest request = SincronizarPeriodoRequest.builder()
                    .codigo("R" + regimen.getId() + "-" + numeral)
                    .nombre(nombrePeriodo)
                    .codigoTipoPeriodo("TP" + tipoPeriodo.getId())
                    .nombreTipoPeriodo(tipoPeriodo.getNombre())
                    .fechaInicio(fechaInicio)
                    .fechaFin(fechaFin)
                    .estado(mapearEstado(regimen.getEstado()))
                    .build();
            planificacionSyncClient.sincronizarPeriodo(request);
        } catch (Exception e) {
            log.warn("No se pudo sincronizar el periodo '{}' del regimen {} con planificacion: {}",
                    nombrePeriodo, regimen.getId(), e.getMessage());
        }
    }

    private String mapearEstado(String estadoRegimen) {
        if (estadoRegimen == null) return "PLANIFICADO";
        return switch (estadoRegimen) {
            case "Abierto", "En curso" -> "EN_CURSO";
            case "Finalizado" -> "CERRADO";
            default -> "PLANIFICADO";
        };
    }

    /**
     * Divide [inicio, fin] en "cantidad" tramos contiguos de dias lo mas parejos posible;
     * el ultimo tramo absorbe los dias sobrantes (p.ej. 2 periodos -> mitad y mitad del rango).
     * Null si el regimen no tiene fecha de inicio/fin.
     */
    private LocalDate[][] dividirRango(LocalDate inicio, LocalDate fin, int cantidad) {
        if (inicio == null || fin == null || fin.isBefore(inicio)) {
            return null;
        }
        long totalDias = ChronoUnit.DAYS.between(inicio, fin) + 1;
        long diasPorTramo = Math.max(totalDias / cantidad, 1);

        LocalDate[][] rangos = new LocalDate[cantidad][2];
        LocalDate cursor = inicio;
        for (int i = 0; i < cantidad; i++) {
            LocalDate finTramo = (i == cantidad - 1) ? fin : cursor.plusDays(diasPorTramo - 1);
            rangos[i][0] = cursor;
            rangos[i][1] = finTramo;
            cursor = finTramo.plusDays(1);
        }
        return rangos;
    }

    private Long obtenerOCrearAnioAcademico(Integer anio) {
        return anioAcademicoRepository.findByAnio(anio)
                .map(AnioAcademico::getId)
                .orElseGet(() -> anioAcademicoRepository.save(
                        AnioAcademico.builder().anio(anio).build()
                ).getId());
    }

    private RegimenAcademico buscarOFallar(Long id) {
        return regimenAcademicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RegimenAcademico no encontrado con id: " + id));
    }
}
