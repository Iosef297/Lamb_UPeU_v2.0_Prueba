package pe.edu.upeu.lamb.planificacion.repository;

import pe.edu.upeu.lamb.planificacion.entity.FranjaHoraria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FranjaHorariaRepository extends JpaRepository<FranjaHoraria, Long> {

    List<FranjaHoraria> findAllByOrderByOrdenAsc();

    boolean existsByOrden(Integer orden);

    boolean existsByOrdenAndIdNot(Integer orden, Long id);
}
