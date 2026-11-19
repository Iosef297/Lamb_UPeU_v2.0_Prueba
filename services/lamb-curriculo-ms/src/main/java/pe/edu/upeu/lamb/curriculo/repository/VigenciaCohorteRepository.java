package pe.edu.upeu.lamb.curriculo.repository;

import pe.edu.upeu.lamb.curriculo.entity.VigenciaCohorte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VigenciaCohorteRepository extends JpaRepository<VigenciaCohorte, Long> {

    List<VigenciaCohorte> findByPlanId(Long idPlan);

    /** Planes que siguen las cohortes de ingreso `cohorte` (p. ej. "2027-1") en un programa. */
    @org.springframework.data.jpa.repository.Query("select v from VigenciaCohorte v where v.plan.idPrograma = :idPrograma "
            + "and v.cohorteInicio <= :cohorte and (v.cohorteFin is null or v.cohorteFin >= :cohorte) order by v.cohorteInicio desc")
    List<VigenciaCohorte> buscarPorCohorte(@org.springframework.data.repository.query.Param("idPrograma") Long idPrograma,
                                           @org.springframework.data.repository.query.Param("cohorte") String cohorte);

    List<VigenciaCohorte> findByPlanIdAndCohorteFinIsNull(Long idPlan);

    boolean existsByPlanIdAndCohorteInicio(Long idPlan, String cohorteInicio);

    boolean existsByPlanIdAndCohorteInicioAndIdNot(Long idPlan, String cohorteInicio, Long id);
}
