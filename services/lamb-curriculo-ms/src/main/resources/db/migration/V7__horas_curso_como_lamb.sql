-- Horas y creditos del curso como en el LAMB real (curso_detalle: ht, hp, hnp, haa, ct, cp).
-- Se quita el tipo de dictado: el LAMB no clasifica el curso, guarda horas de teoria y de practica
-- por separado (hay cursos con HT 0, como Talleres para la Vida o Desarrollo Personal II).
-- Cuantos docentes dictan un curso lo decide el horario del grupo (bloques T y P) en planificacion.
ALTER TABLE cursos_catalogo DROP CONSTRAINT IF EXISTS ck_cursos_catalogo_dictado;
ALTER TABLE cursos_catalogo DROP COLUMN IF EXISTS tipo_dictado;
ALTER TABLE cursos_catalogo ALTER COLUMN horas_teoria SET DEFAULT 0;

ALTER TABLE cursos_catalogo ADD COLUMN IF NOT EXISTS horas_no_presenciales INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cursos_catalogo ADD COLUMN IF NOT EXISTS horas_aprendizaje_autonomo INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cursos_catalogo ADD COLUMN IF NOT EXISTS creditos_teoria INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cursos_catalogo ADD COLUMN IF NOT EXISTS creditos_practica INTEGER NOT NULL DEFAULT 0;

ALTER TABLE cursos_catalogo ADD CONSTRAINT ck_cursos_catalogo_horas CHECK (
    horas_teoria BETWEEN 0 AND 20
    AND horas_practica BETWEEN 0 AND 20
    AND horas_teoria + horas_practica >= 1
    AND horas_no_presenciales BETWEEN 0 AND 40
    AND horas_aprendizaje_autonomo BETWEEN 0 AND 40
);
-- CT y CP son opcionales (0 y 0); si se registran deben sumar los creditos del curso
ALTER TABLE cursos_catalogo ADD CONSTRAINT ck_cursos_catalogo_creditos_tp CHECK (
    creditos_teoria >= 0 AND creditos_practica >= 0
    AND (creditos_teoria + creditos_practica = 0 OR creditos_teoria + creditos_practica = creditos)
);

-- Nota minima aprobatoria del plan (LAMB: plan_programa.nota_aprobatoria, 13 en pregrado UPeU)
ALTER TABLE planes_estudio ADD COLUMN IF NOT EXISTS nota_aprobatoria NUMERIC(4,2) NOT NULL DEFAULT 13;
ALTER TABLE planes_estudio ADD CONSTRAINT ck_planes_estudio_nota_aprobatoria
    CHECK (nota_aprobatoria BETWEEN 0 AND 20);
