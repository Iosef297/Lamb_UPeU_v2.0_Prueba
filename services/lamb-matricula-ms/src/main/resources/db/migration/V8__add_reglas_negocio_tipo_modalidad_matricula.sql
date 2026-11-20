ALTER TABLE tipos_matricula
    ADD COLUMN articulo_legal VARCHAR(40),
    ADD COLUMN creditos_minimos INTEGER,
    ADD COLUMN requiere_pago BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN dias_habiles_limite INTEGER,
    ADD COLUMN max_veces_desaprobado INTEGER;

ALTER TABLE modalidades_matricula
    ADD COLUMN id_modalidad_estudio BIGINT,
    ADD COLUMN articulo_legal VARCHAR(40),
    ADD COLUMN creditos_minimos INTEGER,
    ADD COLUMN requiere_pago BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN dias_habiles_limite INTEGER,
    ADD COLUMN max_veces_desaprobado INTEGER;
