-- V6 permitio varias asistencias por persona y fecha (varias sesiones al dia),
-- pero dentro de una misma sesion de clase el estudiante tiene un solo registro.
CREATE UNIQUE INDEX IF NOT EXISTS uk_registros_asistencia_grupo_persona_sesion
    ON registros_asistencia (id_grupo, id_persona, id_sesion_clase)
    WHERE id_sesion_clase IS NOT NULL;
