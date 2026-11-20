package pe.edu.upeu.ingresospagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.ingresospagos.entity.PagoConcepto;

import java.util.List;

public interface PagoConceptoRepository extends JpaRepository<PagoConcepto, Long> {

    List<PagoConcepto> findByIdEstudiante(String idEstudiante);
}
