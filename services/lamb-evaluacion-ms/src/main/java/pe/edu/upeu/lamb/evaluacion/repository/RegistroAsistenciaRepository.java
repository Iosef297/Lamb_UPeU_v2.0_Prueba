package pe.edu.upeu.lamb.evaluacion.repository;

import pe.edu.upeu.lamb.evaluacion.entity.EstadoAsistencia;
import pe.edu.upeu.lamb.evaluacion.entity.RegistroAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistroAsistenciaRepository extends JpaRepository<RegistroAsistencia, Long> {

    List<RegistroAsistencia> findByIdGrupo(Long idGrupo);

    boolean existsByIdGrupoAndIdPersonaAndIdSesionClaseAndTipoHorario(Long idGrupo, Long idPersona, Long idSesionClase,
            pe.edu.upeu.lamb.evaluacion.entity.TipoHorarioAsistencia tipoHorario);

    boolean existsByIdGrupoAndIdPersonaAndIdSesionClaseAndTipoHorarioAndIdNot(Long idGrupo, Long idPersona, Long idSesionClase,
            pe.edu.upeu.lamb.evaluacion.entity.TipoHorarioAsistencia tipoHorario, Long id);

    long countByIdGrupoAndIdPersona(Long idGrupo, Long idPersona);

    long countByIdGrupoAndIdPersonaAndEstado(Long idGrupo, Long idPersona, EstadoAsistencia estado);
}
