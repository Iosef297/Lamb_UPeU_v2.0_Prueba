-- Programa (carrera) donde se creo el curso del catalogo. Es de lamb-institucional-ms: solo se guarda el id, sin FK.
-- Sirve para que un curso nuevo se vea en el programa donde se creo aunque aun no este en ningun plan de estudios.
ALTER TABLE cursos_catalogo ADD COLUMN IF NOT EXISTS id_programa BIGINT;
