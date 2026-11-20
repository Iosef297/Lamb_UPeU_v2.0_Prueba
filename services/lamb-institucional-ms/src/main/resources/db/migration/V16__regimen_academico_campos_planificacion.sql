ALTER TABLE regimenes_academicos
    ADD COLUMN anio INTEGER,
    ADD COLUMN fecha_inicio DATE,
    ADD COLUMN fecha_fin DATE,
    ADD COLUMN estado VARCHAR(20),
    ADD COLUMN id_tipo_periodo BIGINT;

UPDATE regimenes_academicos SET estado = 'Planificado' WHERE estado IS NULL;

ALTER TABLE regimenes_academicos DROP COLUMN activo;
