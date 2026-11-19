-- El departamento academico es de lamb-institucional-ms (facultad-escuela/departamentos-academicos).
-- cursos_catalogo.id_departamento guarda ese id sin FK (no hay FK entre microservicios)
-- y se elimina la tabla local duplicada, que estaba vacia y colgaba de un plan.
ALTER TABLE cursos_catalogo DROP CONSTRAINT IF EXISTS cursos_catalogo_id_departamento_fkey;
DROP TABLE IF EXISTS departamentos_academicos;
