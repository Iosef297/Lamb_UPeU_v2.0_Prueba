package pe.edu.upeu.lamb.institucional.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.lamb.institucional.entity.PeriodoAcademico;

import java.util.List;

public interface PeriodoAcademicoRepository extends JpaRepository<PeriodoAcademico, Long> {
    List<PeriodoAcademico> findByIdRegimenAcademico(Long idRegimenAcademico);
    void deleteByIdRegimenAcademico(Long idRegimenAcademico);
}
