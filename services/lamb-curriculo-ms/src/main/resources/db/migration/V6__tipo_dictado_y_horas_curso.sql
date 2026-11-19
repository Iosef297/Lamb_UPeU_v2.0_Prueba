-- Las horas van en el curso del catalogo. Todo curso es teorico; algunos son teorico-practicos
-- (la practica la dicta un segundo docente). No hay cursos solo practicos.
-- Reemplaza al CRUD distribuciones_horas (vacio), que se elimina.
ALTER TABLE cursos_catalogo ADD COLUMN IF NOT EXISTS tipo_dictado VARCHAR(20) NOT NULL DEFAULT 'TEORICO';
ALTER TABLE cursos_catalogo ADD COLUMN IF NOT EXISTS horas_teoria INTEGER NOT NULL DEFAULT 1;
ALTER TABLE cursos_catalogo ADD COLUMN IF NOT EXISTS horas_practica INTEGER NOT NULL DEFAULT 0;

-- Cursos ya registrados: tantas horas de teoria como creditos
UPDATE cursos_catalogo SET horas_teoria = creditos;

ALTER TABLE cursos_catalogo ADD CONSTRAINT ck_cursos_catalogo_dictado CHECK (
    tipo_dictado IN ('TEORICO', 'TEORICO_PRACTICO')
    AND horas_teoria BETWEEN 1 AND 20
    AND horas_practica BETWEEN 0 AND 20
    AND ((tipo_dictado = 'TEORICO' AND horas_practica = 0)
      OR (tipo_dictado = 'TEORICO_PRACTICO' AND horas_practica >= 1))
);

DROP TABLE IF EXISTS distribuciones_horas;
