package pe.edu.upeu.lamb.planificacion.service;

import pe.edu.upeu.lamb.planificacion.dto.DocenteDetalleRequest;
import pe.edu.upeu.lamb.planificacion.dto.GrupoActualizarRequest;
import pe.edu.upeu.lamb.planificacion.dto.GrupoRequest;
import pe.edu.upeu.lamb.planificacion.dto.GrupoResponse;
import pe.edu.upeu.lamb.planificacion.dto.HorarioDetalleRequest;
import pe.edu.upeu.lamb.planificacion.dto.VigenciaCursoDto;
import pe.edu.upeu.lamb.planificacion.entity.Ambiente;
import pe.edu.upeu.lamb.planificacion.entity.AsignacionDocente;
import pe.edu.upeu.lamb.planificacion.entity.EstadoGrupo;
import pe.edu.upeu.lamb.planificacion.entity.EstadoOferta;
import pe.edu.upeu.lamb.planificacion.entity.Grupo;
import pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo;
import pe.edu.upeu.lamb.planificacion.entity.OfertaAcademica;
import pe.edu.upeu.lamb.planificacion.entity.RolDocente;
import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import pe.edu.upeu.lamb.planificacion.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.planificacion.mapper.GrupoMapper;
import pe.edu.upeu.lamb.planificacion.messaging.PlanificacionEventosProducer;
import pe.edu.upeu.lamb.planificacion.repository.CupoGrupoRepository;
import pe.edu.upeu.lamb.planificacion.repository.GrupoRepository;
import pe.edu.upeu.lamb.planificacion.repository.OfertaAcademicaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * Microservicio transaccional: Grupo (cabecera) + HorarioGrupo y AsignacionDocente (detalle).
 * La apertura guarda todo o nada: si una sola regla falla, la transaccion hace rollback completo.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GrupoService {

    private static final String GRUPO_ABIERTO = "grupo.abierto";

    private final GrupoRepository grupoRepository;
    private final OfertaAcademicaRepository ofertaAcademicaRepository;
    private final CupoGrupoRepository cupoGrupoRepository;
    private final GrupoMapper grupoMapper;
    private final ReglasGrupoService reglas;
    private final CurriculoConsultaService curriculoConsultaService;
    private final PlanificacionEventosProducer producer;

    @Value("${spring.application.name}")
    private String nombreServicio;

    @Transactional(readOnly = true)
    public List<GrupoResponse> listar(Long idOferta) {
        List<Grupo> grupos = idOferta == null
                ? grupoRepository.findAllConOferta()
                : grupoRepository.findByOfertaId(idOferta);
        return grupos.stream().map(grupoMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public GrupoResponse obtener(Long id) {
        return grupoMapper.toResponse(buscarOFallar(id));
    }

    /**
     * Apertura transaccional del grupo (paso 1 de la saga planificacion -> evaluacion).
     * 1) reglas que no tocan la base, 2) curriculo por Feign (antes de tomar candados),
     * 3) candados en orden fijo, 4) detalle Grupo x Ambiente, 5) detalle Grupo x Docente,
     * 6) un solo saveAndFlush: el EXCLUDE de PostgreSQL es la ultima red si algo se escapo.
     */
    @Transactional
    public GrupoResponse crear(GrupoRequest request) {
        OfertaAcademica oferta = ofertaAcademicaRepository.findById(request.getIdOferta())
                .orElseThrow(() -> new ResourceNotFoundException("Oferta academica no encontrada: " + request.getIdOferta()));
        if (oferta.getEstado() == EstadoOferta.CERRADA) {
            throw new BusinessRuleException("La oferta " + oferta.getId() + " esta CERRADA y no admite grupos nuevos");
        }
        Grupo grupo = grupoMapper.toEntity(request);
        grupo.setOferta(oferta);
        if (grupo.getCiclo() == null) {
            grupo.setCiclo(oferta.getCiclo());
        }
        if (grupoRepository.existsByOfertaIdAndCodigo(oferta.getId(), grupo.getCodigo())) {
            throw new BusinessRuleException("Ya existe el grupo " + grupo.getCodigo() + " en la oferta " + oferta.getId());
        }
        validarDocentesDelPedido(request.getDocentes());

        // La llamada remota va antes de los candados: no se retienen filas bloqueadas mientras se espera a curriculo
        VigenciaCursoDto vigencia = curriculoConsultaService.consultarVigencia(oferta.getCurso().getCodigo());
        if (vigencia != null && !vigencia.isEnPlanVigente()) {
            throw new BusinessRuleException("El curso " + oferta.getCurso().getCodigo() + " no esta en ningun plan de estudios vigente");
        }

        // Candados siempre en el mismo orden (ambientes y luego docentes, por id) para no provocar deadlocks
        Map<Long, Ambiente> ambientes = new TreeMap<>();
        request.getHorarios().stream().map(HorarioDetalleRequest::getIdAmbiente).filter(java.util.Objects::nonNull).sorted().distinct()
                .forEach(idAmbiente -> ambientes.put(idAmbiente, reglas.reservarAmbiente(idAmbiente, grupo.getCupoMaximo())));
        request.getDocentes().stream().map(DocenteDetalleRequest::getIdDocente).sorted()
                .forEach(reglas::bloquearDocente);

        Long idPeriodo = oferta.getPeriodo().getId();
        // Docentes primero: cada bloque de horario puede indicar cual de ellos lo dicta
        Map<Long, AsignacionDocente> porDocente = new java.util.HashMap<>();
        for (DocenteDetalleRequest d : request.getDocentes()) {
            reglas.validarCargaLectiva(d.getIdDocente(), idPeriodo, d.getHorasSemanales(), ReglasGrupoService.SIN_ID);
            AsignacionDocente asignacion = AsignacionDocente.builder()
                    .grupo(grupo)
                    .idDocente(d.getIdDocente())
                    .rol(d.getRol())
                    .horasSemanales(d.getHorasSemanales())
                    .gestionaNota(ReglasGrupoService.permiso(d.getGestionaNota(), d.getRol() != RolDocente.PRACTICA))
                    .gestionaAsistencia(ReglasGrupoService.permiso(d.getGestionaAsistencia(), true))
                    .verHorario(ReglasGrupoService.permiso(d.getVerHorario(), true))
                    .muestraPortal(ReglasGrupoService.permiso(d.getMuestraPortal(), true))
                    .build();
            grupo.getDocentes().add(asignacion);
            porDocente.put(d.getIdDocente(), asignacion);
        }

        for (HorarioDetalleRequest h : request.getHorarios()) {
            reglas.validarRango(h.getHoraInicio(), h.getHoraFin());
            pe.edu.upeu.lamb.planificacion.entity.ModuloPeriodo modulo = reglas.modulo(h.getIdModulo(), idPeriodo);
            java.time.LocalDate inicio = h.getFechaInicio() != null ? h.getFechaInicio() : modulo == null ? null : modulo.getFechaInicio();
            java.time.LocalDate fin = h.getFechaFin() != null ? h.getFechaFin() : modulo == null ? null : modulo.getFechaFin();
            reglas.validarFechas(inicio, fin);
            AsignacionDocente dicta = null;
            if (h.getIdDocente() != null) {
                dicta = porDocente.get(h.getIdDocente());
                if (dicta == null) {
                    throw new BusinessRuleException("El docente " + h.getIdDocente() + " del bloque " + h.getDiaSemana() + " no esta entre los docentes del grupo");
                }
            }
            HorarioGrupo bloque = HorarioGrupo.builder()
                    .grupo(grupo)
                    .ambiente(h.getIdAmbiente() == null ? null : ambientes.get(h.getIdAmbiente()))
                    .idPeriodo(idPeriodo)
                    .diaSemana(h.getDiaSemana())
                    .horaInicio(h.getHoraInicio())
                    .horaFin(h.getHoraFin())
                    .fechaInicio(inicio)
                    .fechaFin(fin)
                    .tipoHorario(h.getTipoHorario() == null ? "TEORIA" : h.getTipoHorario())
                    .numeroSubgrupo(h.getNumeroSubgrupo())
                    .asignacionDocente(dicta)
                    .modulo(modulo)
                    .activo(true)
                    .build();
            reglas.validarSinCruceEnGrupo(grupo, bloque, ReglasGrupoService.SIN_ID);
            reglas.validarAmbienteLibre(bloque.getAmbiente(), idPeriodo, h.getDiaSemana(), h.getHoraInicio(), h.getHoraFin(),
                    inicio, fin, ReglasGrupoService.SIN_ID);
            // El choque de docente se valida contra quien dicta el bloque (todos si el bloque no tiene docente)
            for (AsignacionDocente a : dicta != null ? List.of(dicta) : grupo.getDocentes()) {
                reglas.validarDocenteLibre(a.getIdDocente(), idPeriodo, ReglasGrupoService.SIN_ID,
                        h.getDiaSemana(), h.getHoraInicio(), h.getHoraFin(), inicio, fin);
            }
            grupo.getHorarios().add(bloque);
        }

        if (vigencia == null) {
            grupo.setEstado(EstadoGrupo.PENDIENTE_VALIDACION);
            grupo.setMotivo("curriculo no disponible: falta validar el curso contra el plan vigente");
        } else {
            grupo.setEstado(EstadoGrupo.PENDIENTE_ACTA);
        }
        Grupo guardado = grupoRepository.saveAndFlush(grupo);
        if (guardado.getEstado() == EstadoGrupo.PENDIENTE_ACTA) {
            publicarGrupoAbierto(guardado);
        }
        log.info("component=processor grupoId={} horarios={} docentes={} estado={} status=processed",
                guardado.getId(), guardado.getHorarios().size(), guardado.getDocentes().size(), guardado.getEstado());
        return grupoMapper.toResponse(guardado);
    }

    // Reintento manual de un grupo que quedo PENDIENTE_VALIDACION mientras curriculo estaba caido
    @Transactional
    public GrupoResponse revalidar(Long id) {
        Grupo grupo = buscarOFallar(id);
        if (grupo.getEstado() != EstadoGrupo.PENDIENTE_VALIDACION) {
            throw new BusinessRuleException("El grupo " + id + " esta " + grupo.getEstado() + " y no necesita revalidarse");
        }
        VigenciaCursoDto vigencia = curriculoConsultaService.consultarVigencia(grupo.getCurso().getCodigo());
        if (vigencia == null) {
            throw new BusinessRuleException("curriculo sigue sin responder; el grupo " + id + " continua PENDIENTE_VALIDACION");
        }
        if (!vigencia.isEnPlanVigente()) {
            throw new BusinessRuleException("El curso " + grupo.getCurso().getCodigo() + " no esta en ningun plan de estudios vigente");
        }
        pasarAPendienteActa(grupo);
        return grupoMapper.toResponse(grupo);
    }

    // plan.publicado: los grupos pendientes cuyo curso entro en el plan pasan a PENDIENTE_ACTA
    @Transactional
    public void revalidarPendientes(List<String> codigosCursos) {
        if (codigosCursos == null || codigosCursos.isEmpty()) {
            return;
        }
        List<Grupo> pendientes = grupoRepository.findByEstadoAndOfertaCursoCodigoIn(EstadoGrupo.PENDIENTE_VALIDACION, codigosCursos);
        if (pendientes.isEmpty()) {
            log.info("component=processor status=ignored motivo=\"no hay grupos PENDIENTE_VALIDACION para el plan publicado\"");
        }
        pendientes.forEach(this::pasarAPendienteActa);
    }

    /**
     * acta.abierta: PENDIENTE_ACTA -> ABIERTO. La guardia de estado hace que un evento repetido no tenga efecto.
     */
    @Transactional
    public void marcarAbierto(Long grupoId) {
        Grupo grupo = grupoRepository.findById(grupoId).orElse(null);
        if (grupo == null || grupo.getEstado() != EstadoGrupo.PENDIENTE_ACTA) {
            log.warn("component=processor grupoId={} status=ignored motivo=\"el grupo no existe o ya no esta pendiente de acta\"", grupoId);
            return;
        }
        grupo.setEstado(EstadoGrupo.ABIERTO);
        grupo.setMotivo(null);
        log.info("component=processor grupoId={} estado={} status=processed", grupoId, grupo.getEstado());
    }

    /**
     * Compensacion (acta.rechazada): PENDIENTE_ACTA -> ANULADO. No borra el grupo: deja rastro de que existio
     * y por que fallo, pero libera sus horarios para que otro grupo pueda usar esos ambientes.
     * Misma guardia que marcarAbierto: un acta.rechazada repetido se ignora.
     */
    @Transactional
    public void compensar(Long grupoId, String motivo) {
        Grupo grupo = grupoRepository.findById(grupoId).orElse(null);
        if (grupo == null || grupo.getEstado() != EstadoGrupo.PENDIENTE_ACTA) {
            log.warn("component=processor grupoId={} status=ignored motivo=\"el grupo no existe o ya no esta pendiente de acta\"", grupoId);
            return;
        }
        grupo.setEstado(EstadoGrupo.ANULADO);
        grupo.setMotivo(motivo);
        grupo.getHorarios().forEach(h -> h.setActivo(false));
        log.info("component=processor grupoId={} estado={} status=compensated", grupoId, grupo.getEstado());
    }

    // Edita solo la cabecera. Bloqueo optimista: si la version enviada no es la actual, 409
    @Transactional
    public GrupoResponse actualizar(Long id, GrupoActualizarRequest request) {
        Grupo grupo = buscarOFallar(id);
        if (!grupo.getVersion().equals(request.getVersion())) {
            throw new BusinessRuleException("El grupo " + id + " fue modificado por otro usuario (version actual "
                    + grupo.getVersion() + "); vuelve a consultarlo antes de editar");
        }
        validarNoAnulado(grupo);
        String codigo = request.getCodigo().trim().toUpperCase();
        if (grupoRepository.existsByOfertaIdAndCodigoAndIdNot(grupo.getOferta().getId(), codigo, id)) {
            throw new BusinessRuleException("Ya existe el grupo " + codigo + " en la oferta " + grupo.getOferta().getId());
        }
        int cupo = request.getCupoMaximo();
        grupo.getHorarios().stream()
                .filter(h -> Boolean.TRUE.equals(h.getActivo()))
                .map(HorarioGrupo::getAmbiente)
                .filter(a -> a.getAforo() < cupo)
                .findFirst()
                .ifPresent(a -> {
                    throw new BusinessRuleException("El ambiente " + a.getCodigo() + " tiene aforo " + a.getAforo()
                            + " y no alcanza para un cupo de " + cupo);
                });
        long repartidos = cupoGrupoRepository.sumarCantidadDelGrupo(id, ReglasGrupoService.SIN_ID);
        if (cupo < repartidos) {
            throw new BusinessRuleException("El grupo ya reparte " + repartidos + " cupos por tipo; el cupo maximo no puede ser menor");
        }
        grupo.setCodigo(codigo);
        grupo.setCupoMaximo(cupo);
        if (request.getCiclo() != null) {
            grupo.setCiclo(request.getCiclo());
        }
        return grupoMapper.toResponse(grupoRepository.saveAndFlush(grupo));
    }

    // Con acta abierta (o en camino) el grupo ya existe para evaluacion: no se borra, se anula por la saga
    @Transactional
    public void eliminar(Long id) {
        Grupo grupo = buscarOFallar(id);
        if (grupo.getEstado() == EstadoGrupo.PENDIENTE_ACTA || grupo.getEstado() == EstadoGrupo.ABIERTO) {
            throw new BusinessRuleException("El grupo " + id + " esta " + grupo.getEstado()
                    + ": evaluacion ya tiene (o esta creando) su acta y no se puede eliminar");
        }
        grupoRepository.delete(grupo);
    }

    Grupo buscarOFallar(Long id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado: " + id));
    }

    @Transactional
    public GrupoResponse cambiarPermisos(Long id, boolean puedeEditarSilabo, Long idDelegado) {
        Grupo grupo = buscarOFallar(id);
        validarNoAnulado(grupo);
        grupo.setPuedeEditarSilabo(puedeEditarSilabo);
        grupo.setIdDelegado(idDelegado);
        return grupoMapper.toResponse(grupoRepository.save(grupo));
    }

    /** El docente no edita silabo ni sesiones si el admin cerro el permiso del grupo. */
    void validarEdicionSilabo(Grupo grupo) {
        if (!Boolean.TRUE.equals(grupo.getPuedeEditarSilabo()) && !pe.edu.upeu.lamb.planificacion.config.JwtClaims.esGestion()) {
            throw new BusinessRuleException("La edicion del silabo del grupo " + grupo.getCodigo() + " esta cerrada; pide al coordinador que la habilite");
        }
    }

    void validarNoAnulado(Grupo grupo) {
        if (grupo.getEstado() == EstadoGrupo.ANULADO) {
            throw new BusinessRuleException("El grupo " + grupo.getId() + " esta ANULADO y ya no se puede modificar");
        }
    }

    private void validarDocentesDelPedido(List<DocenteDetalleRequest> docentes) {
        Set<Long> vistos = new HashSet<>();
        for (DocenteDetalleRequest d : docentes) {
            if (!vistos.add(d.getIdDocente())) {
                throw new BusinessRuleException("El docente " + d.getIdDocente() + " esta repetido en el grupo");
            }
        }
        long titulares = docentes.stream().filter(d -> d.getRol() == RolDocente.TITULAR).count();
        if (titulares > 1) {
            throw new BusinessRuleException("Un grupo solo puede tener un docente TITULAR");
        }
    }

    private void pasarAPendienteActa(Grupo grupo) {
        grupo.setEstado(EstadoGrupo.PENDIENTE_ACTA);
        grupo.setMotivo(null);
        publicarGrupoAbierto(grupo);
        log.info("component=processor grupoId={} estado={} status=revalidated", grupo.getId(), grupo.getEstado());
    }

    private void publicarGrupoAbierto(Grupo grupo) {
        producer.publicarTrasCommit(grupoMapper.toGrupoAbiertoEvento(grupo, GRUPO_ABIERTO, nombreServicio));
    }
}
