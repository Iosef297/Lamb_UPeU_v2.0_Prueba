package pe.edu.upeu.lamb.curriculo.repository;

import pe.edu.upeu.lamb.curriculo.entity.AreaCurricular;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AreaCurricularRepository extends JpaRepository<AreaCurricular, Long> {

    java.util.Optional<pe.edu.upeu.lamb.curriculo.entity.AreaCurricular> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    boolean existsByCodigoAndIdNot(String codigo, Long id);
}
