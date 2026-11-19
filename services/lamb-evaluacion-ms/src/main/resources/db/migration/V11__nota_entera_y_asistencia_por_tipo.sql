-- Ajustes con el LAMB real (Portal del Alumno 2026-1 y 2026-2, notes/evaluation y student/assistance):
-- 1) La nota final del modo competencia es entera: 15.2 -> 15, 13.05 -> 13, y con EP < 12.5 la NF es
--    EP redondeado (3.71 -> 4, 9.5 -> 10). ES, EP y ECG se siguen mostrando con 2 decimales.
UPDATE escalas_calificacion SET decimales = 0 WHERE codigo = 'UPEU';

-- 2) La asistencia de una sesion se marca por tipo de horario: Teoria y Practica tienen su propio
--    docente y su propia marcacion ("Sesion 2: Teoria" -> control[tipo_horario = Teoria, tipo = P]).
ALTER TABLE registros_asistencia ADD COLUMN IF NOT EXISTS tipo_horario VARCHAR(10) NOT NULL DEFAULT 'TEORIA';
ALTER TABLE registros_asistencia ADD CONSTRAINT ck_registros_asistencia_tipo_horario
    CHECK (tipo_horario IN ('TEORIA', 'PRACTICA'));
DROP INDEX IF EXISTS uk_registros_asistencia_grupo_persona_sesion;
CREATE UNIQUE INDEX IF NOT EXISTS uk_registros_asistencia_grupo_persona_sesion_tipo
    ON registros_asistencia (id_grupo, id_persona, id_sesion_clase, tipo_horario)
    WHERE id_sesion_clase IS NOT NULL;
