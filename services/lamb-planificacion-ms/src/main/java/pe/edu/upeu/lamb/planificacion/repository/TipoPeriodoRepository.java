package pe.edu.upeu.lamb.planificacion.repository;

import pe.edu.upeu.lamb.planificacion.entity.TipoPeriodo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoPeriodoRepository extends JpaRepository<TipoPeriodo, Long> {

    boolean existsByCodigo(String codigo);

    boolean existsByCodigoAndIdNot(String codigo, Long id);

    Optional<TipoPeriodo> findByCodigo(String codigo);
}
