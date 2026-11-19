package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.entity.Ambiente;
import pe.edu.upeu.lamb.planificacion.entity.DiaSemana;
import pe.edu.upeu.lamb.planificacion.entity.Grupo;
import pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.repository.AmbienteRepository;
import pe.edu.upeu.lamb.planificacion.repository.AsignacionDocenteRepository;
import pe.edu.upeu.lamb.planificacion.repository.CargaLectivaRepository;
import pe.edu.upeu.lamb.planificacion.repository.HorarioGrupoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

/**
 * Reglas de negocio de la operacion transaccional (apertura y cambios de un grupo).
 * MANDATORY: solo se puede usar dentro de una transaccion ya abierta, porque los candados
 * (FOR UPDATE y pg_advisory_xact_lock) duran hasta el commit o rollback de quien llama.
 */
@Service
@RequiredArgsConstructor
@Transactional(propagation = Propagation.MANDATORY)
public class ReglasGrupoService {

    // Para consultas que deben excluir "nada" (grupo u horario todavia sin id)
    static final Long SIN_ID = 0L;

    private final AmbienteRepository ambienteRepository;
    private final HorarioGrupoRepository horarioGrupoRepository;
    private final AsignacionDocenteRepository asignacionDocenteRepository;
    private final CargaLectivaRepository cargaLectivaRepository;
    private final pe.edu.upeu.lamb.planificacion.repository.ModuloPeriodoRepository moduloPeriodoRepository;

    /**
     * Bloquea la fila del ambiente (SELECT ... FOR UPDATE): otra transaccion que quiera reservar
     * el mismo ambiente espera aqui hasta que esta termine, y luego ve el horario ya guardado.
     */
    public Ambiente reservarAmbiente(Long idAmbiente, int cupoMaximo) {
        Ambiente ambiente = ambienteRepository.findByIdParaReserva(idAmbiente)
                .orElseThrow(() -> new ResourceNotFoundException("Ambiente no encontrado: " + idAmbiente));
        if (!Boolean.TRUE.equals(ambiente.getActivo())) {
            throw new BusinessRuleException("El ambiente " + ambiente.getCodigo() + " no esta activo");
        }
        if (ambiente.getAforo() < cupoMaximo) {
            throw new BusinessRuleException("El ambiente " + ambiente.getCodigo() + " tiene aforo " + ambiente.getAforo()
                    + " y no alcanza para un cupo de " + cupoMaximo);
        }
        return ambiente;
    }

    // Serializa las operaciones que tocan al mismo docente (no hay fila de docente que bloquear)
    public void bloquearDocente(Long idDocente) {
        asignacionDocenteRepository.bloquearDocente(idDocente);
    }

    public void validarRango(LocalTime horaInicio, LocalTime horaFin) {
        if (!horaFin.isAfter(horaInicio)) {
            throw new BusinessRuleException("La hora de fin (" + horaFin + ") debe ser posterior a la de inicio (" + horaInicio + ")");
        }
    }

    /** Modulo del bloque: debe ser del mismo periodo que el grupo. */
    public pe.edu.upeu.lamb.planificacion.entity.ModuloPeriodo modulo(Long idModulo, Long idPeriodo) {
        if (idModulo == null) {
            return null;
        }
        pe.edu.upeu.lamb.planificacion.entity.ModuloPeriodo m = moduloPeriodoRepository.findById(idModulo)
                .orElseThrow(() -> new pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException("Modulo del periodo no encontrado: " + idModulo));
        if (!m.getPeriodo().getId().equals(idPeriodo)) {
            throw new BusinessRuleException("El modulo " + m.getNombre() + " es de otro periodo");
        }
        return m;
    }

    /** Por defecto como el LAMB: el jefe de practica toma asistencia pero no pone notas. */
    public static boolean permiso(Boolean pedido, boolean porDefecto) {
        return pedido == null ? porDefecto : pedido;
    }

    public void validarFechas(java.time.LocalDate inicio, java.time.LocalDate fin) {
        if (inicio != null && fin != null && fin.isBefore(inicio)) {
            throw new BusinessRuleException("La fecha de fin del horario (" + fin + ") no puede ser anterior a la de inicio (" + inicio + ")");
        }
    }

    // Rango abierto cuando el bloque no tiene fechas (rige todo el periodo)
    public static final java.time.LocalDate MINIMO = java.time.LocalDate.of(1900, 1, 1);
    public static final java.time.LocalDate MAXIMO = java.time.LocalDate.of(9999, 12, 31);

    // Dos bloques con fechas que no se superponen (ej. modulos distintos) no chocan aunque compartan dia y hora
    static boolean fechasSeCruzan(java.time.LocalDate i1, java.time.LocalDate f1, java.time.LocalDate i2, java.time.LocalDate f2) {
        return !(f1 == null ? MAXIMO : f1).isBefore(i2 == null ? MINIMO : i2) && !(f2 == null ? MAXIMO : f2).isBefore(i1 == null ? MINIMO : i1);
    }

    public void validarAmbienteLibre(Ambiente ambiente, Long idPeriodo, DiaSemana dia, LocalTime horaInicio, LocalTime horaFin,
                                     java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin, Long idHorarioExcluido) {
        if (ambiente == null) {
            return; // "Por confirmar": no hay aula que validar
        }
        List<HorarioGrupo> cruces = horarioGrupoRepository.findCrucesDeAmbiente(ambiente.getId(), idPeriodo, dia, horaInicio, horaFin,
                fechaInicio == null ? MINIMO : fechaInicio, fechaFin == null ? MAXIMO : fechaFin, MINIMO, MAXIMO, idHorarioExcluido);
        if (!cruces.isEmpty()) {
            HorarioGrupo cruce = cruces.get(0);
            throw new BusinessRuleException("El ambiente " + ambiente.getCodigo() + " ya esta ocupado el " + dia + " de "
                    + cruce.getHoraInicio() + " a " + cruce.getHoraFin() + " por el grupo " + cruce.getGrupo().getId());
        }
    }

    // Dentro del mismo grupo tampoco puede haber dos horarios que se pisen (el docente estaria en dos aulas)
    // Subgrupos con docentes distintos (ej. Practica 1 y Practica 2 en dos laboratorios) si pueden coincidir
    public void validarSinCruceEnGrupo(Grupo grupo, HorarioGrupo nuevo, Long idHorarioExcluido) {
        boolean cruza = grupo.getHorarios().stream()
                .filter(h -> Boolean.TRUE.equals(h.getActivo()) && !idHorarioExcluido.equals(h.getId()) && h != nuevo)
                .filter(h -> h.getAsignacionDocente() == null || nuevo.getAsignacionDocente() == null
                        || h.getAsignacionDocente() == nuevo.getAsignacionDocente())
                .anyMatch(h -> h.getDiaSemana() == nuevo.getDiaSemana() && h.getHoraInicio().isBefore(nuevo.getHoraFin())
                        && h.getHoraFin().isAfter(nuevo.getHoraInicio())
                        && fechasSeCruzan(h.getFechaInicio(), h.getFechaFin(), nuevo.getFechaInicio(), nuevo.getFechaFin()));
        DiaSemana dia = nuevo.getDiaSemana();
        LocalTime horaInicio = nuevo.getHoraInicio();
        LocalTime horaFin = nuevo.getHoraFin();
        if (cruza) {
            throw new BusinessRuleException("El grupo ya tiene otro horario el " + dia + " que se cruza con " + horaInicio + "-" + horaFin);
        }
    }

    public void validarDocenteLibre(Long idDocente, Long idPeriodo, Long idGrupo, DiaSemana dia, LocalTime horaInicio, LocalTime horaFin,
                                    java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin) {
        List<HorarioGrupo> cruces = horarioGrupoRepository.findCrucesDeDocente(idDocente, idPeriodo, dia, horaInicio, horaFin,
                fechaInicio == null ? MINIMO : fechaInicio, fechaFin == null ? MAXIMO : fechaFin, MINIMO, MAXIMO, idGrupo);
        if (!cruces.isEmpty()) {
            HorarioGrupo cruce = cruces.get(0);
            throw new BusinessRuleException("El docente " + idDocente + " ya dicta el " + dia + " de " + cruce.getHoraInicio()
                    + " a " + cruce.getHoraFin() + " en el grupo " + cruce.getGrupo().getId());
        }
    }

    // Si el docente tiene carga lectiva registrada en el periodo, no se puede pasar de ese tope
    public void validarCargaLectiva(Long idDocente, Long idPeriodo, int horasNuevas, Long idAsignacionExcluida) {
        cargaLectivaRepository.findByIdDocenteAndPeriodoId(idDocente, idPeriodo).ifPresent(carga -> {
            long asignadas = asignacionDocenteRepository.sumarHorasDelPeriodo(idDocente, idPeriodo, idAsignacionExcluida);
            if (asignadas + horasNuevas > carga.getHorasMaximas()) {
                throw new BusinessRuleException("El docente " + idDocente + " ya tiene " + asignadas + " h asignadas; con "
                        + horasNuevas + " h mas supera su carga lectiva maxima de " + carga.getHorasMaximas() + " h");
            }
        });
    }
}
