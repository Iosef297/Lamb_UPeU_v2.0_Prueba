-- Evaluacion por competencias del LAMB real (UPeU):
--   ES (evaluacion de sesiones) 20 %, EP (evaluacion del producto) 70 %, ECG (competencia generica) 10 %;
--   si EP < 12.5 la nota final es EP. Las evidencias se programan por unidad con su peso.

-- Modo de evaluacion del acta: las actas ya existentes siguen con el promedio ponderado de antes
ALTER TABLE actas ADD COLUMN IF NOT EXISTS modo_evaluacion VARCHAR(20) NOT NULL DEFAULT 'PONDERADO';

-- Parametros de la formula en la escala (umbral del producto y pesos por defecto ES/EP/ECG)
ALTER TABLE escalas_calificacion ADD COLUMN IF NOT EXISTS umbral_producto NUMERIC(4,2) NOT NULL DEFAULT 12.5;
ALTER TABLE escalas_calificacion ADD COLUMN IF NOT EXISTS peso_sesiones NUMERIC(5,2) NOT NULL DEFAULT 20;
ALTER TABLE escalas_calificacion ADD COLUMN IF NOT EXISTS peso_producto NUMERIC(5,2) NOT NULL DEFAULT 70;
ALTER TABLE escalas_calificacion ADD COLUMN IF NOT EXISTS peso_competencia_generica NUMERIC(5,2) NOT NULL DEFAULT 10;

-- Programacion de evaluaciones por unidad: UN1 ES 5 % + EP 20 %, ..., ECG sin fecha
ALTER TABLE evaluaciones_programadas ADD COLUMN IF NOT EXISTS unidad VARCHAR(10);
ALTER TABLE evaluaciones_programadas ADD COLUMN IF NOT EXISTS producto VARCHAR(150);
ALTER TABLE evaluaciones_programadas ADD COLUMN IF NOT EXISTS nro_sesiones INTEGER;
ALTER TABLE evaluaciones_programadas ADD COLUMN IF NOT EXISTS orden INTEGER;
ALTER TABLE evaluaciones_programadas ADD COLUMN IF NOT EXISTS peso NUMERIC(5,2);
ALTER TABLE evaluaciones_programadas ALTER COLUMN fecha DROP NOT NULL;
ALTER TABLE evaluaciones_programadas ADD CONSTRAINT ck_evaluaciones_programadas_peso CHECK (peso IS NULL OR (peso > 0 AND peso <= 100));

-- La nota puede apuntar a la evidencia programada (una sola nota por estudiante y evidencia)
ALTER TABLE notas ADD COLUMN IF NOT EXISTS id_evaluacion_programada BIGINT REFERENCES evaluaciones_programadas(id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_notas_persona_evaluacion_programada
    ON notas (id_persona, id_evaluacion_programada) WHERE id_evaluacion_programada IS NOT NULL;

-- Plazo para justificar: cuenta desde que el docente registro la asistencia
ALTER TABLE registros_asistencia ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP NOT NULL DEFAULT now();

-- Componentes fijos del modo competencia (EVALUACION_COMPETENCIA_GENERICA no cabe en 30)
ALTER TABLE componentes_evaluacion ALTER COLUMN tipo TYPE VARCHAR(40);
INSERT INTO componentes_evaluacion (codigo, nombre, tipo, descripcion) VALUES
    ('ES', 'Evaluacion de sesiones', 'EVALUACION_SESIONES', 'Evidencias de desempeno en las sesiones de cada unidad'),
    ('EP', 'Evaluacion del producto', 'EVALUACION_PRODUCTO', 'Producto academico de cada unidad'),
    ('ECG', 'Evaluacion de competencia generica', 'EVALUACION_COMPETENCIA_GENERICA', 'Competencia generica del perfil (ej. Servicio y Mision)')
ON CONFLICT (codigo) DO NOTHING;

-- Escala UPeU: aprueba con 13 (nota minima del silabo). Pasa a ser la vigente.
UPDATE escalas_calificacion SET vigente = false WHERE vigente = true;
INSERT INTO escalas_calificacion (codigo, nombre, nota_minima, nota_maxima, nota_aprobatoria, decimales, redondeo, vigente,
                                  umbral_producto, peso_sesiones, peso_producto, peso_competencia_generica)
VALUES ('UPEU', 'Vigesimal UPeU (competencias)', 0, 20, 13, 2, 'HALF_UP', true, 12.5, 20, 70, 10)
ON CONFLICT (codigo) DO UPDATE SET vigente = true;
