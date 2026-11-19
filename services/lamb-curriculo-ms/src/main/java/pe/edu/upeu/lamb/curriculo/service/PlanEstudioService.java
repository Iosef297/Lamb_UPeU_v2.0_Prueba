package pe.edu.upeu.lamb.curriculo.service;

import pe.edu.upeu.lamb.curriculo.dto.ClonarPlanRequest;
import pe.edu.upeu.lamb.curriculo.dto.PlanCursoActualizarRequest;
import pe.edu.upeu.lamb.curriculo.dto.PlanCursoRequest;
import pe.edu.upeu.lamb.curriculo.dto.PlanEstudioRequest;
import pe.edu.upeu.lamb.curriculo.dto.PlanEstudioResponse;
import pe.edu.upeu.lamb.curriculo.dto.PrerrequisitoRequest;
import pe.edu.upeu.lamb.curriculo.entity.EstadoPlan;
import pe.edu.upeu.lamb.curriculo.entity.Modalidad;
import pe.edu.upeu.lamb.curriculo.entity.PlanCurso;
import pe.edu.upeu.lamb.curriculo.entity.PlanEstudio;
import pe.edu.upeu.lamb.curriculo.entity.Prerrequisito;
import pe.edu.upeu.lamb.curriculo.exception.BusinessRuleException;
import pe.edu.upeu.lamb.curriculo.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.curriculo.mapper.PlanEstudioMapper;
import pe.edu.upeu.lamb.curriculo.repository.AreaCurricularRepository;
import pe.edu.upeu.lamb.curriculo.repository.CursoCatalogoRepository;
import pe.edu.upeu.lamb.curriculo.repository.ModalidadRepository;
import pe.edu.upeu.lamb.curriculo.repository.PlanCursoRepository;
import pe.edu.upeu.lamb.curriculo.repository.TipoCursoRepository;
import pe.edu.upeu.lamb.curriculo.repository.PlanEstudioRepository;
import pe.edu.upeu.lamb.curriculo.repository.PrerrequisitoRepository;
import pe.edu.upeu.lamb.curriculo.repository.VigenciaCohorteRepository;
import pe.edu.upeu.lamb.curriculo.entity.VigenciaCohorte;
import lombok.RequiredArgsConstructor;
import pe.edu.upeu.lamb.curriculo.dto.VigenciaCursoResponse;
import pe.edu.upeu.lamb.curriculo.messaging.CurriculoEventosProducer;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlanEstudioService {

    private final PlanEstudioRepository planEstudioRepository;
    private final PlanCursoRepository planCursoRepository;
    private final PrerrequisitoRepository prerrequisitoRepository;
    private final CursoCatalogoRepository cursoCatalogoRepository;
    private final TipoCursoRepository tipoCursoRepository;
    private final AreaCurricularRepository areaCurricularRepository;
    private final ModalidadRepository modalidadRepository;
    private final PlanEstudioMapper planEstudioMapper;
    private final CurriculoEventosProducer producer;
    private final EntityManager entityManager;
    private final VigenciaCohorteRepository vigenciaCohorteRepository;
    private final pe.edu.upeu.lamb.curriculo.repository.CicloPlanRepository cicloPlanRepository;
    private final pe.edu.upeu.lamb.curriculo.repository.CreditosCicloRepository creditosCicloRepository;
    private final pe.edu.upeu.lamb.curriculo.repository.GrupoElectivoRepository grupoElectivoRepository;
    private final pe.edu.upeu.lamb.curriculo.repository.RequisitoEgresoRepository requisitoEgresoRepository;

    @Value("${spring.application.name}")
    private String nombreServicio;

    @Transactional(readOnly = true)
    public List<PlanEstudioResponse> listar(Long idPrograma) {
        List<PlanEstudio> planes = idPrograma == null
                ? planEstudioRepository.findAll()
                : planEstudioRepository.findByIdPrograma(idPrograma);
        return planes.stream().map(planEstudioMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PlanEstudioResponse obtener(Long id) {
        return planEstudioMapper.toResponse(buscarOFallar(id));
    }

    @Transactional(readOnly = true)
    public PlanEstudioResponse obtenerVigente(Long idPrograma) {
        return planEstudioRepository.findByIdProgramaAndEstado(idPrograma, EstadoPlan.VIGENTE)
                .map(planEstudioMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("El programa " + idPrograma + " no tiene plan vigente"));
    }

    // Consulta sincrona de planificacion (Feign): no lanza 404, responde enPlanVigente=false
    @Transactional(readOnly = true)
    public VigenciaCursoResponse consultarVigencia(String codigoCurso) {
        String codigo = codigoCurso.trim().toUpperCase();
        return planCursoRepository.findFirstByCursoCatalogoCodigoAndPlanEstado(codigo, EstadoPlan.VIGENTE)
                .or(() -> planCursoRepository.findFirstByCursoCatalogoCodigoAndPlanEstadoIn(codigo, java.util.List.of(EstadoPlan.EN_EXTINCION)))
                .map(c -> VigenciaCursoResponse.builder()
                        .codigoCurso(codigo)
                        .enPlanVigente(true)
                        .idPlan(c.getPlan().getId())
                        .version(c.getPlan().getVersion())
                        .nombreCurso(c.getNombreCurso())
                        .creditos(c.getCreditos())
                        .build())
                .orElseGet(() -> VigenciaCursoResponse.builder().codigoCurso(codigo).enPlanVigente(false).build());
    }

    /** Plan que sigue la cohorte de ingreso (p. ej. "2027-1") en el programa: el estudiante lo conserva hasta el final. */
    @Transactional(readOnly = true)
    public PlanEstudioResponse obtenerPorCohorte(Long idPrograma, String cohorte) {
        return vigenciaCohorteRepository.buscarPorCohorte(idPrograma, cohorte.trim()).stream().findFirst()
                .map(v -> planEstudioMapper.toResponse(v.getPlan()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ningún plan del programa " + idPrograma + " tiene registrada la cohorte " + cohorte));
    }

    @Transactional
    public PlanEstudioResponse crear(PlanEstudioRequest request) {
        if (planEstudioRepository.existsByIdProgramaAndVersion(request.getIdPrograma(), request.getVersion().trim())) {
            throw new BusinessRuleException("Ya existe el plan " + request.getVersion() + " para el programa " + request.getIdPrograma());
        }
        PlanEstudio plan = planEstudioMapper.toEntity(request);
        plan.setModalidad(buscarModalidad(request.getIdModalidad()));
        if (request.getNotaAprobatoria() != null) {
            plan.setNotaAprobatoria(request.getNotaAprobatoria());
        }
        return planEstudioMapper.toResponse(planEstudioRepository.save(plan));
    }

    // Solo un plan en BORRADOR se edita: uno VIGENTE o DEROGADO ya es historia oficial
    @Transactional
    public PlanEstudioResponse actualizar(Long id, PlanEstudioRequest request) {
        PlanEstudio plan = buscarOFallar(id);
        validarBorrador(plan);
        String version = request.getVersion().trim();
        boolean cambiaClave = !plan.getIdPrograma().equals(request.getIdPrograma()) || !plan.getVersion().equals(version);
        if (cambiaClave && planEstudioRepository.existsByIdProgramaAndVersion(request.getIdPrograma(), version)) {
            throw new BusinessRuleException("Ya existe el plan " + version + " para el programa " + request.getIdPrograma());
        }
        plan.setIdPrograma(request.getIdPrograma());
        plan.setVersion(version);
        plan.setNombre(request.getNombre().trim());
        plan.setModalidad(buscarModalidad(request.getIdModalidad()));
        if (request.getNotaAprobatoria() != null) {
            plan.setNotaAprobatoria(request.getNotaAprobatoria());
        }
        return planEstudioMapper.toResponse(planEstudioRepository.save(plan));
    }

    @Transactional
    public void eliminar(Long id) {
        PlanEstudio plan = buscarOFallar(id);
        validarBorrador(plan);
        borrarDependencias(id);
        // Primero los prerrequisitos: si no, Hibernate deja id_plan_curso_requisito en null (NOT NULL) al borrar los cursos
        plan.getCursos().forEach(c -> c.getPrerrequisitos().clear());
        planEstudioRepository.saveAndFlush(plan);
        planEstudioRepository.delete(plan);
    }

    /** Borra lo que cuelga del plan (ciclos, electivos, perfiles, requisitos, documentos...) para poder eliminar el borrador completo. */
    private void borrarDependencias(Long id) {
        String cursosDelPlan = "(SELECT id FROM plan_cursos WHERE id_plan = :id)";
        String[] sentencias = {
            "DELETE FROM cursos_externos_convalidables WHERE id_plan_curso IN " + cursosDelPlan
                + " OR id_tabla IN (SELECT id FROM tablas_convalidacion WHERE id_plan = :id)",
            "DELETE FROM tablas_convalidacion WHERE id_plan = :id",
            "DELETE FROM cursos_investigacion WHERE id_plan_curso IN " + cursosDelPlan,
            "DELETE FROM equivalencias_plan WHERE id_plan_curso_origen IN " + cursosDelPlan + " OR id_plan_curso_destino IN " + cursosDelPlan,
            "DELETE FROM requisitos_matricula WHERE id_plan_curso IN " + cursosDelPlan + " OR id_curso_requisito IN " + cursosDelPlan,
            "DELETE FROM grupo_electivo_cursos WHERE id_plan_curso IN " + cursosDelPlan
                + " OR id_grupo_electivo IN (SELECT id FROM grupos_electivos WHERE id_plan = :id)",
            "DELETE FROM grupo_electivo_catalogo WHERE id_grupo_electivo IN (SELECT id FROM grupos_electivos WHERE id_plan = :id)",
            "DELETE FROM grupos_electivos WHERE id_plan = :id",
            "DELETE FROM creditos_ciclo WHERE id_ciclo_plan IN (SELECT id FROM ciclos_plan WHERE id_plan = :id)",
            "DELETE FROM ciclos_plan WHERE id_plan = :id",
            "DELETE FROM competencias_especificas WHERE id_perfil_egreso IN (SELECT id FROM perfiles_egreso WHERE id_plan = :id)",
            "DELETE FROM perfiles_egreso WHERE id_plan = :id",
            "DELETE FROM perfiles_ingreso WHERE id_plan = :id",
            "DELETE FROM ejes_curriculares WHERE id_plan = :id",
            "DELETE FROM menciones WHERE id_plan = :id",
            "DELETE FROM requisitos_egreso WHERE id_plan = :id",
            "DELETE FROM requisitos_idioma WHERE id_plan = :id",
            "DELETE FROM requisitos_practicas WHERE id_plan = :id",
            "DELETE FROM requisitos_investigacion WHERE id_plan = :id",
            "DELETE FROM requisitos_extracurriculares WHERE id_plan = :id",
            "DELETE FROM modalidades_titulacion WHERE id_plan = :id",
            "DELETE FROM resoluciones_plan WHERE id_plan = :id",
            "DELETE FROM mallas_curriculares WHERE id_plan = :id",
            "DELETE FROM vigencias_cohorte WHERE id_plan = :id",
            "DELETE FROM evaluaciones_curriculares WHERE id_plan = :id",
            "DELETE FROM solicitudes_modificacion_curricular WHERE id_plan = :id",
        };
        for (String sql : sentencias) {
            entityManager.createNativeQuery(sql).setParameter("id", id).executeUpdate();
        }
    }

    @Transactional
    public PlanEstudioResponse agregarCurso(Long idPlan, PlanCursoRequest request) {
        return agregar(idPlan, request, true);
    }

    /** Lo usa el grupo de electivos al ubicarse: ya valido el limite del ciclo con los creditos que de verdad se llevan. */
    @Transactional
    public PlanEstudioResponse agregarCursoSinLimite(Long idPlan, PlanCursoRequest request) {
        return agregar(idPlan, request, false);
    }

    private PlanEstudioResponse agregar(Long idPlan, PlanCursoRequest request, boolean controlarLimite) {
        PlanEstudio plan = buscarOFallar(idPlan);
        validarBorrador(plan);
        PlanCurso curso = planEstudioMapper.toEntity(request, plan);
        curso.setCursoCatalogo(cursoCatalogoRepository.findById(request.getIdCursoCatalogo())
                .orElseThrow(() -> new ResourceNotFoundException("Curso del catalogo no encontrado: " + request.getIdCursoCatalogo())));
        curso.setTipo(tipoCursoRepository.findById(request.getIdTipoCurso())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de curso no encontrado: " + request.getIdTipoCurso())));
        if (request.getIdAreaCurricular() != null) {
            curso.setAreaCurricular(areaCurricularRepository.findById(request.getIdAreaCurricular())
                    .orElseThrow(() -> new ResourceNotFoundException("Area curricular no encontrada: " + request.getIdAreaCurricular())));
        }
        if (planCursoRepository.existsByPlanIdAndCursoCatalogoId(idPlan, curso.getCursoCatalogo().getId())) {
            throw new BusinessRuleException("El curso " + curso.getCodigoCurso() + " ya esta en el plan");
        }
        if (controlarLimite) {
            validarLimiteCiclo(plan, request.getCiclo(), curso.getCreditos(), null);
        }
        plan.getCursos().add(curso);
        PlanEstudio guardado = planEstudioRepository.saveAndFlush(plan);
        sincronizarCreditosEgreso(guardado);
        return planEstudioMapper.toResponse(guardado);
    }

    @Transactional
    public PlanEstudioResponse eliminarCurso(Long idPlan, Long idPlanCurso) {
        PlanEstudio plan = buscarOFallar(idPlan);
        validarBorrador(plan);
        PlanCurso curso = buscarCursoOFallar(idPlan, idPlanCurso);
        if (prerrequisitoRepository.existsByRequisitoId(idPlanCurso)) {
            throw new BusinessRuleException("El curso " + curso.getCodigoCurso() + " es prerrequisito de otro curso del plan");
        }
        plan.getCursos().remove(curso);
        PlanEstudio guardado = planEstudioRepository.saveAndFlush(plan);
        sincronizarCreditosEgreso(guardado);
        return planEstudioMapper.toResponse(guardado);
    }

    @Transactional
    public PlanEstudioResponse agregarPrerrequisito(Long idPlan, Long idPlanCurso, PrerrequisitoRequest request) {
        PlanEstudio plan = buscarOFallar(idPlan);
        validarBorrador(plan);
        PlanCurso curso = buscarCursoOFallar(idPlan, idPlanCurso);
        PlanCurso requisito = buscarCursoOFallar(idPlan, request.getIdPlanCursoRequisito());

        // Exigir un ciclo menor tambien evita ciclos entre prerrequisitos
        if (requisito.getCiclo() >= curso.getCiclo()) {
            throw new BusinessRuleException("El prerrequisito debe ser de un ciclo anterior al del curso");
        }
        boolean yaExiste = curso.getPrerrequisitos().stream()
                .anyMatch(p -> p.getRequisito().getId().equals(requisito.getId()));
        if (yaExiste) {
            throw new BusinessRuleException("El curso " + curso.getCodigoCurso() + " ya tiene ese prerrequisito");
        }
        curso.getPrerrequisitos().add(Prerrequisito.builder().curso(curso).requisito(requisito).build());
        return planEstudioMapper.toResponse(planEstudioRepository.saveAndFlush(plan));
    }

    @Transactional
    public PlanEstudioResponse eliminarPrerrequisito(Long idPlan, Long idPlanCurso, Long idPlanCursoRequisito) {
        PlanEstudio plan = buscarOFallar(idPlan);
        validarBorrador(plan);
        PlanCurso curso = buscarCursoOFallar(idPlan, idPlanCurso);
        boolean eliminado = curso.getPrerrequisitos()
                .removeIf(p -> p.getRequisito().getId().equals(idPlanCursoRequisito));
        if (!eliminado) {
            throw new ResourceNotFoundException("Prerrequisito no encontrado: " + idPlanCursoRequisito);
        }
        return planEstudioMapper.toResponse(planEstudioRepository.saveAndFlush(plan));
    }

    @Transactional
    public PlanEstudioResponse publicar(Long id) {
        PlanEstudio plan = buscarOFallar(id);
        validarBorrador(plan);
        if (plan.getCursos().isEmpty()) {
            throw new BusinessRuleException("No se puede publicar un plan sin cursos");
        }

        // El plan vigente anterior NO se deroga: deja de recibir ingresantes (EN_EXTINCION) pero sus cohortes lo terminan
        Integer anio = anioDeVersion(plan.getVersion());
        Long idPlanDerogado = planEstudioRepository
                .findByIdProgramaAndEstado(plan.getIdPrograma(), EstadoPlan.VIGENTE)
                .map(anterior -> {
                    anterior.setEstado(EstadoPlan.EN_EXTINCION);
                    planEstudioRepository.saveAndFlush(anterior);
                    cerrarIngresoDe(anterior, anio);
                    return anterior.getId();
                })
                .orElse(null);

        plan.setEstado(EstadoPlan.VIGENTE);
        plan.setFechaPublicacion(Instant.now());
        PlanEstudio publicado = planEstudioRepository.saveAndFlush(plan);
        abrirIngresoDe(publicado, anio);

        // Se envia a Kafka despues del commit (curriculo-eventos, key = planId)
        producer.publicarTrasCommit(planEstudioMapper.toPlanPublicadoEvento(publicado, idPlanDerogado, nombreServicio));
        return planEstudioMapper.toResponse(publicado);
    }

    /**
     * Los creditos del requisito de egreso salen de la malla: obligatorios (cursos sueltos), electivos
     * (cantidad a elegir x creditos de cada grupo) y totales. Asi coinciden con "Creditos a cursar" del plan.
     * Solo actualiza el requisito si ya existe (conserva el promedio minimo).
     */
    @Transactional
    public void sincronizarCreditosEgreso(Long idPlan) {
        sincronizarCreditosEgreso(buscarOFallar(idPlan));
    }

    private void sincronizarCreditosEgreso(PlanEstudio plan) {
        List<pe.edu.upeu.lamb.curriculo.entity.RequisitoEgreso> requisitos = requisitoEgresoRepository.findByPlanId(plan.getId());
        if (requisitos.isEmpty()) {
            return;
        }
        int total = plan.getCursos().stream().map(PlanCurso::getCiclo).distinct()
                .mapToInt(ciclo -> creditosDelCiclo(plan, ciclo, null)).sum();
        int electivos = 0;
        for (pe.edu.upeu.lamb.curriculo.entity.GrupoElectivo g : grupoElectivoRepository.findByPlanId(plan.getId())) {
            PlanCurso primero = plan.getCursos().stream().filter(c -> g.getIdPlanCursos().contains(c.getId())).findFirst().orElse(null);
            if (primero != null) {
                electivos += g.getCantidadElegir() * primero.getCreditos();
            }
        }
        for (pe.edu.upeu.lamb.curriculo.entity.RequisitoEgreso r : requisitos) {
            r.setCreditosTotales(Math.max(1, total));
            r.setCreditosElectivos(electivos);
            r.setCreditosObligatorios(Math.max(0, total - electivos));
            requisitoEgresoRepository.save(r);
        }
    }

    /** Creditos que de verdad lleva el estudiante en un ciclo: cursos sueltos + (cantidad a elegir x creditos) por grupo de electivos. */
    private int creditosDelCiclo(PlanEstudio plan, int ciclo, Long excluirPlanCurso) {
        List<pe.edu.upeu.lamb.curriculo.entity.GrupoElectivo> grupos = grupoElectivoRepository.findByPlanId(plan.getId());
        java.util.Set<Long> enGrupo = new java.util.HashSet<>();
        grupos.forEach(g -> enGrupo.addAll(g.getIdPlanCursos()));
        int total = 0;
        for (PlanCurso c : plan.getCursos()) {
            if (c.getCiclo() == ciclo && !enGrupo.contains(c.getId()) && !c.getId().equals(excluirPlanCurso)) {
                total += c.getCreditos();
            }
        }
        for (pe.edu.upeu.lamb.curriculo.entity.GrupoElectivo g : grupos) {
            PlanCurso primero = plan.getCursos().stream()
                    .filter(c -> g.getIdPlanCursos().contains(c.getId()) && !c.getId().equals(excluirPlanCurso))
                    .findFirst().orElse(null);
            if (primero != null && primero.getCiclo() == ciclo) {
                total += g.getCantidadElegir() * primero.getCreditos();
            }
        }
        return total;
    }

    /** Un ciclo con creditos maximos definidos no admite mas cursos cuando se pasaria de ese maximo. */
    private void validarLimiteCiclo(PlanEstudio plan, int ciclo, int creditosNuevos, Long excluirPlanCurso) {
        Integer maximo = cicloPlanRepository.findByPlanId(plan.getId()).stream()
                .filter(c -> c.getNumero() == ciclo)
                .findFirst()
                .flatMap(c -> creditosCicloRepository.findByCicloPlanId(c.getId()).stream().findFirst())
                .map(pe.edu.upeu.lamb.curriculo.entity.CreditosCiclo::getCreditosMaximos)
                .orElse(null);
        if (maximo == null) {
            return;
        }
        int total = creditosDelCiclo(plan, ciclo, excluirPlanCurso) + creditosNuevos;
        if (total > maximo) {
            throw new BusinessRuleException("El ciclo " + ciclo + " llegaria a " + total + " creditos y su maximo es " + maximo
                    + ": no se pueden agregar mas cursos a este ciclo");
        }
    }

    /** Lo llama el grupo de electivos antes de ubicarse en un ciclo (suma cantidad a elegir x creditos). */
    @Transactional(readOnly = true)
    public void validarLimiteCiclo(Long idPlan, int ciclo, int creditosNuevos) {
        validarLimiteCiclo(buscarOFallar(idPlan), ciclo, creditosNuevos, null);
    }

    /** Cierre definitivo: solo un plan EN_EXTINCION (sin estudiantes con ese plan) pasa a DEROGADO. */
    @Transactional
    public PlanEstudioResponse derogar(Long id) {
        PlanEstudio plan = buscarOFallar(id);
        if (plan.getEstado() != EstadoPlan.EN_EXTINCION) {
            throw new BusinessRuleException("Solo un plan EN_EXTINCION se puede derogar (cierre definitivo)");
        }
        plan.setEstado(EstadoPlan.DEROGADO);
        return planEstudioMapper.toResponse(planEstudioRepository.save(plan));
    }

    // Version "2028-1" -> 2028 (el plan siempre empieza en el primer semestre); otra forma -> null (no se tocan las cohortes)
    private static Integer anioDeVersion(String version) {
        return version != null && version.matches("^\\d{4}-1$") ? Integer.valueOf(version.substring(0, 4)) : null;
    }

    // El plan anterior termina con la ultima cohorte del año previo al nuevo plan
    private void cerrarIngresoDe(PlanEstudio anterior, Integer anioNuevo) {
        if (anioNuevo == null) {
            return;
        }
        String fin = (anioNuevo - 1) + "-2";
        for (VigenciaCohorte v : vigenciaCohorteRepository.findByPlanIdAndCohorteFinIsNull(anterior.getId())) {
            if (v.getCohorteInicio().compareTo(fin) <= 0) {
                v.setCohorteFin(fin);
                vigenciaCohorteRepository.save(v);
            }
        }
    }

    // El plan publicado lo siguen las cohortes que ingresan desde su año (sin fecha de fin)
    private void abrirIngresoDe(PlanEstudio plan, Integer anio) {
        if (anio == null || !vigenciaCohorteRepository.findByPlanId(plan.getId()).isEmpty()) {
            return;
        }
        vigenciaCohorteRepository.save(VigenciaCohorte.builder()
                .plan(plan)
                .cohorteInicio(anio + "-1")
                .observacion("Ingresantes desde " + anio + ": terminan con este plan.")
                .build());
    }

    /**
     * Copia un plan (cualquier estado) a un nuevo BORRADOR del mismo programa con sus cursos y
     * prerrequisitos: asi la version 2026 se arma partiendo de la 2022 en vez de desde cero.
     */
    @Transactional
    public PlanEstudioResponse clonar(Long id, ClonarPlanRequest request) {
        PlanEstudio origen = buscarOFallar(id);
        String version = request.getVersion().trim();
        if (planEstudioRepository.existsByIdProgramaAndVersion(origen.getIdPrograma(), version)) {
            throw new BusinessRuleException("Ya existe el plan " + version + " para el programa " + origen.getIdPrograma());
        }
        PlanEstudio copia = PlanEstudio.builder()
                .idPrograma(origen.getIdPrograma())
                .version(version)
                .nombre(request.getNombre().trim())
                .modalidad(origen.getModalidad())
                .notaAprobatoria(origen.getNotaAprobatoria())
                .estado(EstadoPlan.BORRADOR)
                .fechaRegistro(Instant.now())
                .build();
        Map<Long, PlanCurso> equivalente = new HashMap<>();
        for (PlanCurso c : origen.getCursos()) {
            PlanCurso nuevo = PlanCurso.builder()
                    .plan(copia)
                    .cursoCatalogo(c.getCursoCatalogo())
                    .ciclo(c.getCiclo())
                    .tipo(c.getTipo())
                    .areaCurricular(c.getAreaCurricular())
                    .prerrequisitos(new java.util.ArrayList<>())
                    .build();
            equivalente.put(c.getId(), nuevo);
            copia.getCursos().add(nuevo);
        }
        for (PlanCurso c : origen.getCursos()) {
            PlanCurso nuevo = equivalente.get(c.getId());
            for (Prerrequisito p : c.getPrerrequisitos()) {
                nuevo.getPrerrequisitos().add(Prerrequisito.builder()
                        .curso(nuevo)
                        .requisito(equivalente.get(p.getRequisito().getId()))
                        .build());
            }
        }
        return planEstudioMapper.toResponse(planEstudioRepository.saveAndFlush(copia));
    }

    @Transactional
    public PlanEstudioResponse actualizarCurso(Long idPlan, Long idPlanCurso, PlanCursoActualizarRequest request) {
        PlanEstudio plan = buscarOFallar(idPlan);
        validarBorrador(plan);
        PlanCurso curso = buscarCursoOFallar(idPlan, idPlanCurso);
        int ciclo = request.getCiclo();
        // El cambio de ciclo no puede romper la regla "prerrequisito de un ciclo anterior"
        for (Prerrequisito p : curso.getPrerrequisitos()) {
            if (p.getRequisito().getCiclo() >= ciclo) {
                throw new BusinessRuleException("El curso " + curso.getCodigoCurso() + " tiene como prerrequisito a "
                        + p.getRequisito().getCodigoCurso() + " (ciclo " + p.getRequisito().getCiclo() + "): debe quedar en un ciclo posterior");
            }
        }
        for (PlanCurso otro : plan.getCursos()) {
            boolean dependeDeEste = otro.getPrerrequisitos().stream().anyMatch(p -> p.getRequisito().getId().equals(curso.getId()));
            if (dependeDeEste && otro.getCiclo() <= ciclo) {
                throw new BusinessRuleException("El curso " + curso.getCodigoCurso() + " es prerrequisito de "
                        + otro.getCodigoCurso() + " (ciclo " + otro.getCiclo() + "): debe quedar en un ciclo anterior");
            }
        }
        if (ciclo != curso.getCiclo()) {
            validarLimiteCiclo(plan, ciclo, curso.getCreditos(), curso.getId());
        }
        curso.setCiclo(ciclo);
        curso.setTipo(tipoCursoRepository.findById(request.getIdTipoCurso())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de curso no encontrado: " + request.getIdTipoCurso())));
        curso.setAreaCurricular(request.getIdAreaCurricular() == null ? null
                : areaCurricularRepository.findById(request.getIdAreaCurricular())
                        .orElseThrow(() -> new ResourceNotFoundException("Area curricular no encontrada: " + request.getIdAreaCurricular())));
        PlanEstudio guardado = planEstudioRepository.saveAndFlush(plan);
        sincronizarCreditosEgreso(guardado);
        return planEstudioMapper.toResponse(guardado);
    }

    private Modalidad buscarModalidad(Long idModalidad) {
        if (idModalidad == null) {
            return null;
        }
        return modalidadRepository.findById(idModalidad)
                .orElseThrow(() -> new ResourceNotFoundException("Modalidad no encontrada: " + idModalidad));
    }

    private void validarBorrador(PlanEstudio plan) {
        if (plan.getEstado() != EstadoPlan.BORRADOR) {
            throw new BusinessRuleException("El plan " + plan.getId() + " esta " + plan.getEstado() + " y ya no se puede modificar");
        }
    }

    private PlanEstudio buscarOFallar(Long id) {
        return planEstudioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de estudio no encontrado: " + id));
    }

    private PlanCurso buscarCursoOFallar(Long idPlan, Long idPlanCurso) {
        return planCursoRepository.findByIdAndPlanId(idPlanCurso, idPlan)
                .orElseThrow(() -> new ResourceNotFoundException("Curso " + idPlanCurso + " no encontrado en el plan " + idPlan));
    }
}
