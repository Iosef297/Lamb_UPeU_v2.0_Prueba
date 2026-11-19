package pe.edu.upeu.lamb.planificacion.repository;

import pe.edu.upeu.lamb.planificacion.entity.DiaSemana;
import pe.edu.upeu.lamb.planificacion.entity.HorarioGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

public interface HorarioGrupoRepository extends JpaRepository<HorarioGrupo, Long> {

    List<HorarioGrupo> findByGrupoId(Long idGrupo);

    @Query("SELECT h FROM HorarioGrupo h JOIN FETCH h.grupo g LEFT JOIN FETCH h.ambiente "
            + "WHERE g.id IN :idsGrupo AND h.activo = true ORDER BY h.diaSemana, h.horaInicio")
    List<HorarioGrupo> findActivosDeGrupos(@Param("idsGrupo") Collection<Long> idsGrupo);

    // Dos rangos [inicio, fin) se cruzan si cada uno empieza antes de que termine el otro
    @Query("SELECT h FROM HorarioGrupo h WHERE h.ambiente.id = :idAmbiente AND h.idPeriodo = :idPeriodo "
            + "AND h.diaSemana = :dia AND h.activo = true AND h.horaInicio < :horaFin AND h.horaFin > :horaInicio "
            + "AND COALESCE(h.fechaInicio, :minimo) <= :fechaFin AND COALESCE(h.fechaFin, :maximo) >= :fechaInicio "
            + "AND h.id <> :idExcluido")
    List<HorarioGrupo> findCrucesDeAmbiente(@Param("idAmbiente") Long idAmbiente,
                                            @Param("idPeriodo") Long idPeriodo,
                                            @Param("dia") DiaSemana dia,
                                            @Param("horaInicio") LocalTime horaInicio,
                                            @Param("horaFin") LocalTime horaFin,
                                            @Param("fechaInicio") java.time.LocalDate fechaInicio,
                                            @Param("fechaFin") java.time.LocalDate fechaFin,
                                            @Param("minimo") java.time.LocalDate minimo,
                                            @Param("maximo") java.time.LocalDate maximo,
                                            @Param("idExcluido") Long idExcluido);

    // Bloques de OTROS grupos del periodo que dicta el docente (los suyos, o los sin docente de un grupo donde esta asignado)
    // y que se cruzan en dia, horas y fechas
    @Query("SELECT h FROM HorarioGrupo h LEFT JOIN h.asignacionDocente ad WHERE h.idPeriodo = :idPeriodo "
            + "AND h.diaSemana = :dia AND h.activo = true AND h.horaInicio < :horaFin AND h.horaFin > :horaInicio "
            + "AND COALESCE(h.fechaInicio, :minimo) <= :fechaFin AND COALESCE(h.fechaFin, :maximo) >= :fechaInicio "
            + "AND h.grupo.id <> :idGrupo AND ((ad IS NOT NULL AND ad.idDocente = :idDocente) OR (ad IS NULL AND EXISTS "
            + "(SELECT 1 FROM AsignacionDocente a WHERE a.grupo = h.grupo AND a.idDocente = :idDocente)))")
    List<HorarioGrupo> findCrucesDeDocente(@Param("idDocente") Long idDocente,
                                           @Param("idPeriodo") Long idPeriodo,
                                           @Param("dia") DiaSemana dia,
                                           @Param("horaInicio") LocalTime horaInicio,
                                           @Param("horaFin") LocalTime horaFin,
                                           @Param("fechaInicio") java.time.LocalDate fechaInicio,
                                           @Param("fechaFin") java.time.LocalDate fechaFin,
                                           @Param("minimo") java.time.LocalDate minimo,
                                           @Param("maximo") java.time.LocalDate maximo,
                                           @Param("idGrupo") Long idGrupo);
}
