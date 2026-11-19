package pe.edu.upeu.lamb.planificacion.repository;

import pe.edu.upeu.lamb.planificacion.entity.CursoIntensivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursoIntensivoRepository extends JpaRepository<CursoIntensivo, Long> {
    List<CursoIntensivo> findByPeriodoId(Long idPeriodo);

    boolean existsByPeriodoIdAndCursoId(Long idPeriodo, Long idCurso);

    boolean existsByPeriodoIdAndCursoIdAndIdNot(Long idPeriodo, Long idCurso, Long id);
}
