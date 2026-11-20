-- Ley Universitaria (Ley N. 30220, universidades) y Ley N. 30512 (institutos
-- y escuelas de educacion superior tecnologica) reconocen unicamente estos
-- niveles y grados/titulos academicos. Catalogos bloqueados (lockedCatalog
-- en frontend): no se pueden agregar ni eliminar filas.

INSERT INTO niveles_academicos (id, nombre, descripcion) VALUES
    (2, 'Pregrado', 'Estudios universitarios conducentes al grado de Bachiller y titulo profesional (Ley Universitaria 30220).'),
    (3, 'Posgrado', 'Estudios universitarios conducentes a los grados de Maestro y Doctor (Ley Universitaria 30220).'),
    (4, 'Educacion Superior Tecnologica', 'Estudios no universitarios en Institutos (IES) y Escuelas (EES) de Educacion Superior Tecnologica, conducentes a grado de Bachiller Tecnico y titulos de Tecnico/Profesional Tecnico (Ley N. 30512, art. 16).')
ON CONFLICT (id) DO NOTHING;

-- Columna que liga cada grado/titulo a su nivel academico, para filtrar
-- el combo "Grado academico" segun el "Nivel academico" elegido.
ALTER TABLE grados_academicos ADD COLUMN IF NOT EXISTS id_nivel_academico BIGINT REFERENCES niveles_academicos(id);

INSERT INTO grados_academicos (id, nombre, descripcion, id_nivel_academico) VALUES
    (2, 'Bachiller', 'Grado academico de Bachiller (Ley Universitaria 30220, art. 42).', 2),
    (3, 'Titulo Profesional', 'Titulo profesional conferido a nombre de la Nacion (Ley Universitaria 30220, art. 43).', 2),
    (4, 'Maestro', 'Grado academico de Maestro (Ley Universitaria 30220, art. 42).', 3),
    (5, 'Doctor', 'Grado academico de Doctor (Ley Universitaria 30220, art. 42).', 3),
    (6, 'Bachiller Tecnico', 'Grado otorgado a nombre de la Nacion tras programa de 3 anios/6 semestres (Ley N. 30512, art. 16 inc. b).', 4),
    (7, 'Titulo de Tecnico', 'Titulo otorgado a nombre de la Nacion tras programa de 2 anios (Ley N. 30512, art. 16 inc. c).', 4),
    (8, 'Titulo de Profesional Tecnico', 'Titulo otorgado a nombre de la Nacion tras programa de 3 anios con trabajo de investigacion o suficiencia profesional (Ley N. 30512, art. 16 inc. d).', 4)
ON CONFLICT (id) DO NOTHING;

-- Por si la tabla ya existia con filas previas a esta migracion (ids 2-5
-- insertados en un despliegue anterior sin la columna nueva).
UPDATE grados_academicos SET id_nivel_academico = 2 WHERE id IN (2, 3) AND id_nivel_academico IS NULL;
UPDATE grados_academicos SET id_nivel_academico = 3 WHERE id IN (4, 5) AND id_nivel_academico IS NULL;

-- Remueve el placeholder temporal "Sin asignar": reasigna cualquier
-- programa que lo use hacia Pregrado/Bachiller y lo borra del catalogo.
UPDATE programas SET id_nivel_academico = 2 WHERE id_nivel_academico = 1;
DELETE FROM niveles_academicos WHERE id = 1 AND nombre = 'Sin asignar';

UPDATE programas SET id_grado_academico_catalogo = 2 WHERE id_grado_academico_catalogo = 1;
DELETE FROM grados_academicos WHERE id = 1 AND nombre = 'Sin asignar';

SELECT setval('niveles_academicos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM niveles_academicos));
SELECT setval('grados_academicos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM grados_academicos));
