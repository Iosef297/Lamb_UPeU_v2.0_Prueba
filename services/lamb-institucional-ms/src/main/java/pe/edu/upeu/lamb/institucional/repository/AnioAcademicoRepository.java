package pe.edu.upeu.lamb.institucional.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.lamb.institucional.entity.AnioAcademico;

import java.util.Optional;

public interface AnioAcademicoRepository extends JpaRepository<AnioAcademico, Long> {
    Optional<AnioAcademico> findByAnio(Integer anio);
}
