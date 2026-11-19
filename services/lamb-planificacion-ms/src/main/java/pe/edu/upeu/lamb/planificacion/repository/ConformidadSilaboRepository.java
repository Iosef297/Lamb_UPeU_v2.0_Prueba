package pe.edu.upeu.lamb.planificacion.repository;

import pe.edu.upeu.lamb.planificacion.entity.ConformidadSilabo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConformidadSilaboRepository extends JpaRepository<ConformidadSilabo, Long> {

    List<ConformidadSilabo> findByGrupoId(Long idGrupo);

    boolean existsByGrupoIdAndIdPersona(Long idGrupo, Long idPersona);
}
