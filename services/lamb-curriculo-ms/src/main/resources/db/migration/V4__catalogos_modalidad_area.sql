-- Valores base de dos catalogos que usa el plan de estudios y que estaban vacios.
-- Modalidades de estudio: Ley Universitaria 30220, art. 39.
INSERT INTO modalidades (codigo, nombre, descripcion) VALUES
    ('PRESENCIAL', 'Presencial', 'Clases en el campus; hasta 20 % de creditos virtuales'),
    ('SEMIPRESENCIAL', 'Semipresencial', 'Entre 20 % y 70 % de creditos virtuales'),
    ('A_DISTANCIA', 'A distancia', 'Mas de 70 % de creditos virtuales')
ON CONFLICT (codigo) DO NOTHING;

-- Areas curriculares del pregrado: Ley Universitaria 30220, art. 40.
INSERT INTO areas_curriculares (codigo, nombre, descripcion) VALUES
    ('GENERALES', 'Estudios generales', 'Obligatorios, no menos de 35 creditos'),
    ('ESPECIFICOS', 'Estudios especificos', 'Formacion propia de la carrera'),
    ('ESPECIALIDAD', 'Estudios de especialidad', 'Formacion de la especialidad o mencion')
ON CONFLICT (codigo) DO NOTHING;
