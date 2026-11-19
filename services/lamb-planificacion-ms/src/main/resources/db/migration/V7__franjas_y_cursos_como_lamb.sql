-- Ajustes con el LAMB real (Portal del Alumno, student-courses-schedule, 2026-2):
-- 1) Horas exactas de las 17 franjas: hay 5 min entre franjas y 10 min en los recreos;
--    la Noche empieza en la franja 12 (18:45), no en la 11.
UPDATE franjas_horarias f SET hora_inicio = v.ini, hora_fin = v.fin, turno = v.turno
FROM (VALUES
    (0, TIME '07:30', TIME '08:20', 'MANANA'), (1, TIME '08:25', TIME '09:15', 'MANANA'),
    (2, TIME '09:20', TIME '10:10', 'MANANA'), (3, TIME '10:20', TIME '11:10', 'MANANA'),
    (4, TIME '11:15', TIME '12:05', 'MANANA'), (5, TIME '12:10', TIME '13:00', 'MANANA'),
    (6, TIME '13:10', TIME '14:00', 'TARDE'),  (7, TIME '14:05', TIME '14:55', 'TARDE'),
    (8, TIME '15:00', TIME '15:50', 'TARDE'),  (9, TIME '16:00', TIME '16:50', 'TARDE'),
    (10, TIME '16:55', TIME '17:45', 'TARDE'), (11, TIME '17:50', TIME '18:40', 'TARDE'),
    (12, TIME '18:45', TIME '19:35', 'NOCHE'), (13, TIME '19:40', TIME '20:30', 'NOCHE'),
    (14, TIME '20:35', TIME '21:25', 'NOCHE'), (15, TIME '21:30', TIME '22:20', 'NOCHE'),
    (16, TIME '22:25', TIME '23:25', 'NOCHE')
) AS v(orden, ini, fin, turno)
WHERE f.orden = v.orden;

-- 2) Copia local del curso con sus horas (HT, HP, HNP): llegan de lamb-curriculo-ms en el evento
--    plan.publicado, igual que en el LAMB cada curso del alumno trae credito, ht y hp.
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS horas_teoria INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS horas_practica INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS horas_no_presenciales INTEGER NOT NULL DEFAULT 0;

-- 3) Modulo con codigo y formato (LAMB: codigo "R" + "Regular - Pregrado", id_tipo_formato_modulo)
ALTER TABLE modulos_periodo ADD COLUMN IF NOT EXISTS codigo VARCHAR(5) NOT NULL DEFAULT 'R';
ALTER TABLE modulos_periodo ADD COLUMN IF NOT EXISTS formato VARCHAR(10) NOT NULL DEFAULT 'REGULAR';
ALTER TABLE modulos_periodo ADD CONSTRAINT ck_modulos_periodo_formato CHECK (formato IN ('REGULAR', 'MODULAR'));

-- 4) Solicitud de apertura de grupo con el tipo del LAMB: curso extraprogramatico (SE) o dirigido (SD)
ALTER TABLE solicitudes_apertura_grupo ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'EXTRAPROGRAMATICO';
ALTER TABLE solicitudes_apertura_grupo ADD CONSTRAINT ck_solicitudes_apertura_tipo CHECK (tipo IN ('EXTRAPROGRAMATICO', 'DIRIGIDO'));
