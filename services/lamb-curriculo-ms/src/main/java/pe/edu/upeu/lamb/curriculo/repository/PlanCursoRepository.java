package pe.edu.upeu.lamb.curriculo.repository;

import pe.edu.upeu.lamb.curriculo.entity.EstadoPlan;
import pe.edu.upeu.lamb.curriculo.entity.PlanCurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlanCursoRepository extends JpaRepository<PlanCurso, Long> {
    Optional<PlanCurso> findByIdAndPlanId(Long id, Long idPlan);

    Optional<PlanCurso> findFirstByCursoCatalogoCodigoAndPlanEstado(String codigoCurso, EstadoPlan estado);

    // Un curso retirado del plan nuevo se sigue dictando mientras haya cohortes en el plan que lo tiene (EN_EXTINCION)
    Optional<PlanCurso> findFirstByCursoCatalogoCodigoAndPlanEstadoIn(String codigoCurso, java.util.Collection<EstadoPlan> estados);

    Optional<PlanCurso> findByPlanIdAndCursoCatalogoId(Long idPlan, Long idCursoCatalogo);

    boolean existsByPlanIdAndCursoCatalogoId(Long idPlan, Long idCursoCatalogo);
}
