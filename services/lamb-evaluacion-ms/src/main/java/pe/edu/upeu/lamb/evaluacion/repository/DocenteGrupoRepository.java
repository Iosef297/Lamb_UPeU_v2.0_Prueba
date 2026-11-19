package pe.edu.upeu.lamb.evaluacion.repository;

import pe.edu.upeu.lamb.evaluacion.entity.DocenteGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocenteGrupoRepository extends JpaRepository<DocenteGrupo, Long> {

    Optional<DocenteGrupo> findByIdGrupoAndIdDocente(Long idGrupo, Long idDocente);

    List<DocenteGrupo> findByIdDocente(Long idDocente);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM DocenteGrupo d WHERE d.idGrupo = :idGrupo")
    void borrarDelGrupo(@Param("idGrupo") Long idGrupo);
}
