package pe.edu.upeu.lamb.curriculo.repository;

import pe.edu.upeu.lamb.curriculo.entity.DimensionCompetencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DimensionCompetenciaRepository extends JpaRepository<DimensionCompetencia, Long> {

    List<DimensionCompetencia> findByTipoCompetenciaAndIdCompetenciaOrderByNumero(String tipoCompetencia, Long idCompetencia);

    boolean existsByTipoCompetenciaAndIdCompetenciaAndNumeroAndIdNot(String tipoCompetencia, Long idCompetencia, Integer numero, Long id);
}
