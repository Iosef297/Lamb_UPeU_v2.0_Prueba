-- Cursos de nivelacion/verano -> cursos intensivos de vacaciones (para estudiantes que desaprobaron el curso).
-- Se abren solo si llegan a un cupo minimo de inscritos; pertenecen al periodo regular anterior a las vacaciones.
ALTER TABLE cursos_nivelacion RENAME TO cursos_intensivos;
ALTER TABLE cursos_intensivos DROP CONSTRAINT IF EXISTS uk_cursos_nivelacion_periodo_curso_tipo;
ALTER TABLE cursos_intensivos DROP COLUMN IF EXISTS tipo;
ALTER TABLE cursos_intensivos ADD COLUMN IF NOT EXISTS cupo_minimo INTEGER NOT NULL DEFAULT 1;
ALTER TABLE cursos_intensivos ADD COLUMN IF NOT EXISTS estado VARCHAR(30) NOT NULL DEFAULT 'EN_CONVOCATORIA';
ALTER TABLE cursos_intensivos ADD CONSTRAINT ck_cursos_intensivos_cupo_minimo CHECK (cupo_minimo >= 1);
ALTER TABLE cursos_intensivos ADD CONSTRAINT ck_cursos_intensivos_cupos CHECK (cupo_minimo <= cupo_maximo);
ALTER TABLE cursos_intensivos ADD CONSTRAINT uk_cursos_intensivos_periodo_curso UNIQUE (id_periodo, id_curso);
ALTER TABLE cursos_intensivos RENAME CONSTRAINT ck_cursos_nivelacion_fecha_fin TO ck_cursos_intensivos_fecha_fin;

-- Solo hay periodos regulares (semestres -1 y -2): sin tipos verano ni nivelacion
DELETE FROM tipos_periodo t
 WHERE t.codigo IN ('VERANO', 'NIVELACION')
   AND NOT EXISTS (SELECT 1 FROM periodos_academicos p WHERE p.id_tipo_periodo = t.id);
