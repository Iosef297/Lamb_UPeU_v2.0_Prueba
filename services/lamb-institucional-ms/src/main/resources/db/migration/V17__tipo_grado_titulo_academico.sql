-- Distingue "grado academico" de "titulo" dentro del catalogo
-- grados_academicos, segun Ley Universitaria 30220 (art. 42 grado / art. 43
-- titulo) y Ley N. 30512 (art. 16 inc. b grado / inc. c,d titulo).

ALTER TABLE grados_academicos ADD COLUMN IF NOT EXISTS tipo VARCHAR(10);

UPDATE grados_academicos SET tipo = 'GRADO' WHERE id IN (2, 4, 5, 6);
UPDATE grados_academicos SET tipo = 'TITULO' WHERE id IN (3, 7, 8);
UPDATE grados_academicos SET tipo = 'GRADO' WHERE tipo IS NULL;
