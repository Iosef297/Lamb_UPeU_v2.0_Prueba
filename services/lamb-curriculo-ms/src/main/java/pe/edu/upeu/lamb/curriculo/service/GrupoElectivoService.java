package pe.edu.upeu.lamb.curriculo.service;

import pe.edu.upeu.lamb.curriculo.dto.GrupoElectivoRequest;
import pe.edu.upeu.lamb.curriculo.dto.GrupoElectivoResponse;
import pe.edu.upeu.lamb.curriculo.dto.PlanCursoRequest;
import pe.edu.upeu.lamb.curriculo.dto.UbicarGrupoElectivoRequest;
import pe.edu.upeu.lamb.curriculo.entity.GrupoElectivo;
import pe.edu.upeu.lamb.curriculo.entity.PlanEstudio;
import pe.edu.upeu.lamb.curriculo.exception.BusinessRuleException;
import pe.edu.upeu.lamb.curriculo.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.curriculo.mapper.GrupoElectivoMapper;
import pe.edu.upeu.lamb.curriculo.repository.AreaCurricularRepository;
import pe.edu.upeu.lamb.curriculo.repository.CursoCatalogoRepository;
import pe.edu.upeu.lamb.curriculo.repository.GrupoElectivoRepository;
import pe.edu.upeu.lamb.curriculo.repository.PlanCursoRepository;
import pe.edu.upeu.lamb.curriculo.repository.PlanEstudioRepository;
import pe.edu.upeu.lamb.curriculo.repository.TipoCursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Grupo de electivos (elegir N de M). Dos momentos:
 *  1. Se DEFINE con cursos del catalogo (la bolsa de opciones); todavia no toca la malla.
 *  2. Se UBICA en la malla con nombre y ciclo: sus cursos entran al plan como Electivo y el grupo los toma.
 * Un curso del catalogo solo puede estar en un grupo del plan.
 */
@Service
@RequiredArgsConstructor
public class GrupoElectivoService {

    private final GrupoElectivoRepository grupoElectivoRepository;
    private final PlanEstudioRepository planEstudioRepository;
    private final GrupoElectivoMapper grupoElectivoMapper;
    private final PlanCursoRepository planCursoRepository;
    private final PlanEstudioService planEstudioService;
    private final TipoCursoRepository tipoCursoRepository;
    private final AreaCurricularRepository areaCurricularRepository;
    private final CursoCatalogoRepository cursoCatalogoRepository;

    @Transactional(readOnly = true)
    public List<GrupoElectivoResponse> listar(Long idPlan) {
        List<GrupoElectivo> lista = idPlan == null
                ? grupoElectivoRepository.findAll()
                : grupoElectivoRepository.findByPlanId(idPlan);
        return lista.stream().map(grupoElectivoMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public GrupoElectivoResponse obtener(Long id) {
        return grupoElectivoMapper.toResponse(buscarOFallar(id));
    }

    @Transactional
    public GrupoElectivoResponse crear(GrupoElectivoRequest request) {
        PlanEstudio plan = buscarPlan(request.getIdPlan());
        validar(request, null, Set.of());
        GrupoElectivo grupo = grupoElectivoMapper.toEntity(request);
        grupo.setPlan(plan);
        return grupoElectivoMapper.toResponse(grupoElectivoRepository.save(grupo));
    }

    @Transactional
    public GrupoElectivoResponse actualizar(Long id, GrupoElectivoRequest request) {
        GrupoElectivo grupo = buscarOFallar(id);
        if (!grupo.getPlan().getId().equals(request.getIdPlan())) {
            throw new BusinessRuleException("Un grupo de electivos no se puede pasar a otro plan");
        }
        boolean enMalla = !grupo.getIdPlanCursos().isEmpty();
        Set<Long> propios = new HashSet<>(grupo.getIdCursosCatalogo());
        Set<Long> pedidos = new LinkedHashSet<>(request.getIdCursosCatalogo());
        if (enMalla && !pedidos.equals(propios)) {
            throw new BusinessRuleException("El grupo ya esta en la malla: quitalo de la malla antes de cambiar sus cursos");
        }
        validar(request, id, propios);
        grupo.setNombre(request.getNombre().trim());
        grupo.setCantidadElegir(request.getCantidadElegir());
        if (!enMalla) {
            grupo.getIdCursosCatalogo().clear();
            grupo.getIdCursosCatalogo().addAll(pedidos);
        }
        GrupoElectivo guardado = grupoElectivoRepository.saveAndFlush(grupo);
        planEstudioService.sincronizarCreditosEgreso(guardado.getPlan().getId());
        return grupoElectivoMapper.toResponse(guardado);
    }

    /** Pone el grupo en la malla: sus cursos entran al plan como Electivo (especialidad) en el ciclo indicado. */
    @Transactional
    public GrupoElectivoResponse ubicar(Long id, UbicarGrupoElectivoRequest request) {
        GrupoElectivo grupo = buscarOFallar(id);
        if (!grupo.getIdPlanCursos().isEmpty()) {
            throw new BusinessRuleException("El grupo ya esta en la malla");
        }
        Long idPlan = grupo.getPlan().getId();
        Long idElectivo = tipoCursoRepository.findByCodigo("ELECTIVO")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de curso ELECTIVO")).getId();
        Long idArea = areaCurricularRepository.findByCodigo("ESPECIALIDAD").map(a -> a.getId()).orElse(null);
        // El grupo suma (cantidad a elegir x creditos) al ciclo: se respeta el maximo de creditos del ciclo
        int creditosPorCurso = cursoCatalogoRepository.findById(grupo.getIdCursosCatalogo().get(0)).map(c -> c.getCreditos()).orElse(0);
        planEstudioService.validarLimiteCiclo(idPlan, request.getCiclo(), grupo.getCantidadElegir() * creditosPorCurso);
        List<Long> idsPlanCurso = new ArrayList<>();
        for (Long idCurso : grupo.getIdCursosCatalogo()) {
            PlanCursoRequest curso = new PlanCursoRequest();
            curso.setIdCursoCatalogo(idCurso);
            curso.setCiclo(request.getCiclo());
            curso.setIdTipoCurso(idElectivo);
            curso.setIdAreaCurricular(idArea);
            planEstudioService.agregarCursoSinLimite(idPlan, curso);
            idsPlanCurso.add(planCursoRepository.findByPlanIdAndCursoCatalogoId(idPlan, idCurso)
                    .orElseThrow(() -> new ResourceNotFoundException("No se pudo agregar el curso " + idCurso + " al plan")).getId());
        }
        grupo.setNombre(request.getNombre().trim());
        grupo.getIdPlanCursos().addAll(idsPlanCurso);
        GrupoElectivo guardado = grupoElectivoRepository.saveAndFlush(grupo);
        planEstudioService.sincronizarCreditosEgreso(idPlan);
        return grupoElectivoMapper.toResponse(guardado);
    }

    @Transactional
    public void eliminar(Long id) {
        GrupoElectivo grupo = buscarOFallar(id);
        Long idPlan = grupo.getPlan().getId();
        grupoElectivoRepository.delete(grupo);
        grupoElectivoRepository.flush();
        planEstudioService.sincronizarCreditosEgreso(idPlan);
    }

    GrupoElectivo buscarOFallar(Long id) {
        return grupoElectivoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo de electivos no encontrado: " + id));
    }

    private PlanEstudio buscarPlan(Long idPlan) {
        return planEstudioRepository.findById(idPlan)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de estudio no encontrado: " + idPlan));
    }

    private void validar(GrupoElectivoRequest request, Long id, Set<Long> propios) {
        Set<Long> pedidos = new LinkedHashSet<>(request.getIdCursosCatalogo());
        if (pedidos.size() != request.getIdCursosCatalogo().size()) {
            throw new BusinessRuleException("Un curso esta repetido en el grupo de electivos");
        }
        if (request.getCantidadElegir() > pedidos.size()) {
            throw new BusinessRuleException("No se puede pedir elegir " + request.getCantidadElegir()
                    + " cursos de un grupo que solo tiene " + pedidos.size());
        }
        // Todos los cursos del grupo valen lo mismo: el estudiante elige N y los creditos no cambian
        Integer creditos = null;
        for (Long idCurso : pedidos) {
            Integer cr = cursoCatalogoRepository.findById(idCurso).map(c -> c.getCreditos())
                    .orElseThrow(() -> new ResourceNotFoundException("Curso del catalogo no encontrado: " + idCurso));
            if (creditos == null) {
                creditos = cr;
            } else if (!creditos.equals(cr)) {
                throw new BusinessRuleException("Todos los cursos del grupo deben tener los mismos creditos: el primero tiene " + creditos + " y otro tiene " + cr);
            }
        }
        // Un curso solo esta en un grupo del plan
        for (GrupoElectivo otro : grupoElectivoRepository.findByPlanId(request.getIdPlan())) {
            if (id != null && id.equals(otro.getId())) {
                continue;
            }
            for (Long idCurso : otro.getIdCursosCatalogo()) {
                if (pedidos.contains(idCurso)) {
                    throw new BusinessRuleException("Un curso que marcaste ya esta en el grupo \"" + otro.getNombre() + "\"");
                }
            }
        }
        for (Long idCurso : pedidos) {
            if (!cursoCatalogoRepository.existsById(idCurso)) {
                throw new ResourceNotFoundException("Curso del catalogo no encontrado: " + idCurso);
            }
            // Los cursos ya agregados a la malla como cursos sueltos no sirven: el grupo toma cursos libres
            if (!propios.contains(idCurso) && planCursoRepository.existsByPlanIdAndCursoCatalogoId(request.getIdPlan(), idCurso)) {
                throw new BusinessRuleException("El curso " + idCurso + " ya esta en la malla del plan: el grupo toma cursos libres del catalogo");
            }
        }
    }
}
