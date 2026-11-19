package pe.edu.upeu.lamb.evaluacion.service;

import pe.edu.upeu.lamb.evaluacion.config.JwtClaims;
import pe.edu.upeu.lamb.evaluacion.entity.DocenteGrupo;
import pe.edu.upeu.lamb.evaluacion.event.GrupoAbiertoEvento;
import pe.edu.upeu.lamb.evaluacion.exception.AccesoDenegadoException;
import pe.edu.upeu.lamb.evaluacion.repository.DocenteGrupoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Docentes del grupo y sus permisos (gestiona_nota, gestiona_asistencia).
 * ADMIN y COORDINADOR no se restringen; el DOCENTE solo trabaja en sus grupos y con el permiso que le dieron.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocenteGrupoService {

    private final DocenteGrupoRepository docenteGrupoRepository;

    // El evento trae la lista completa: se reemplaza la copia local del grupo
    @Transactional
    public void sincronizar(GrupoAbiertoEvento evento) {
        if (evento.getDocentes() == null) {
            return; // evento antiguo sin lista de docentes
        }
        docenteGrupoRepository.borrarDelGrupo(evento.getGrupoId());
        List<DocenteGrupo> nuevos = evento.getDocentes().stream()
                .map(d -> DocenteGrupo.builder()
                        .idGrupo(evento.getGrupoId())
                        .idDocente(d.getIdDocente())
                        .rol(d.getRol())
                        .gestionaNota(!Boolean.FALSE.equals(d.getGestionaNota()))
                        .gestionaAsistencia(!Boolean.FALSE.equals(d.getGestionaAsistencia()))
                        .build())
                .toList();
        docenteGrupoRepository.saveAll(nuevos);
        log.info("component=processor eventType={} grupoId={} docentes={} status=synced",
                evento.getTipoEvento(), evento.getGrupoId(), nuevos.size());
    }

    @Transactional(readOnly = true)
    public List<DocenteGrupo> delDocente(Long idDocente) {
        return docenteGrupoRepository.findByIdDocente(idDocente);
    }

    public void validarPuedeNotas(Long idGrupo) {
        validar(idGrupo, true);
    }

    public void validarPuedeAsistencia(Long idGrupo) {
        validar(idGrupo, false);
    }

    private void validar(Long idGrupo, boolean notas) {
        if (JwtClaims.esGestion()) {
            return;
        }
        Long idPersona = JwtClaims.idPersonaActual();
        DocenteGrupo docente = docenteGrupoRepository.findByIdGrupoAndIdDocente(idGrupo, idPersona)
                .orElseThrow(() -> new AccesoDenegadoException("No estas asignado como docente del grupo " + idGrupo));
        boolean permitido = notas ? docente.getGestionaNota() : docente.getGestionaAsistencia();
        if (!permitido) {
            throw new AccesoDenegadoException("Tu asignacion en el grupo " + idGrupo + " no gestiona "
                    + (notas ? "notas" : "asistencia") + " (docente " + docente.getRol() + ")");
        }
    }
}
