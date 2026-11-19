-- Un grupo de electivos se define con cursos del CATALOGO (la bolsa de opciones) y recien se ubica en la malla
-- (nombre + ciclo): ahi sus cursos pasan a ser del plan con tipo Electivo y se llena grupo_electivo_cursos.
CREATE TABLE IF NOT EXISTS grupo_electivo_catalogo (
    id_grupo_electivo BIGINT NOT NULL REFERENCES grupos_electivos(id) ON DELETE CASCADE,
    id_curso_catalogo BIGINT NOT NULL REFERENCES cursos_catalogo(id),
    CONSTRAINT uk_grupo_electivo_catalogo UNIQUE (id_grupo_electivo, id_curso_catalogo)
);

-- Los grupos que ya estaban en la malla conservan sus cursos como bolsa
INSERT INTO grupo_electivo_catalogo (id_grupo_electivo, id_curso_catalogo)
SELECT gec.id_grupo_electivo, pc.id_curso_catalogo
  FROM grupo_electivo_cursos gec
  JOIN plan_cursos pc ON pc.id = gec.id_plan_curso
ON CONFLICT DO NOTHING;
