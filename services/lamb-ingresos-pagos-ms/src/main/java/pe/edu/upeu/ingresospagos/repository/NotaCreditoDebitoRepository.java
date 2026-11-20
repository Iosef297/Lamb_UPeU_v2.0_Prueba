package pe.edu.upeu.ingresospagos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.ingresospagos.entity.NotaCreditoDebito;

public interface NotaCreditoDebitoRepository extends JpaRepository<NotaCreditoDebito, Long> {
}
