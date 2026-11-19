package pe.edu.upeu.lamb.planificacion.repository;

import pe.edu.upeu.lamb.planificacion.entity.ModuloPeriodo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuloPeriodoRepository extends JpaRepository<ModuloPeriodo, Long> {

    List<ModuloPeriodo> findByPeriodoIdOrderByFechaInicio(Long idPeriodo);

    boolean existsByPeriodoIdAndNombreAndIdNot(Long idPeriodo, String nombre, Long id);
}
