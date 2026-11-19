-- Ciclo del grupo: una oferta (periodo + programa + curso) puede tener grupos de cohortes que llevan el curso
-- en ciclos distintos (planes diferentes). La oferta guarda el ciclo menor; cada grupo guarda el suyo.
ALTER TABLE grupos ADD COLUMN IF NOT EXISTS ciclo INTEGER;
ALTER TABLE grupos DROP CONSTRAINT IF EXISTS ck_grupos_ciclo;
ALTER TABLE grupos ADD CONSTRAINT ck_grupos_ciclo CHECK (ciclo IS NULL OR ciclo BETWEEN 1 AND 14);
UPDATE grupos g SET ciclo = o.ciclo FROM ofertas_academicas o WHERE o.id = g.id_oferta AND g.ciclo IS NULL;
