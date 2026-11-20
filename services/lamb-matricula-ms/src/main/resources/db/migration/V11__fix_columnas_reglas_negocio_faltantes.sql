ALTER TABLE tipos_matricula
    ADD COLUMN IF NOT EXISTS articulo_legal VARCHAR(40),
    ADD COLUMN IF NOT EXISTS creditos_minimos INTEGER,
    ADD COLUMN IF NOT EXISTS requiere_pago BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS dias_habiles_limite INTEGER,
    ADD COLUMN IF NOT EXISTS max_veces_desaprobado INTEGER;

ALTER TABLE modalidades_matricula
    ADD COLUMN IF NOT EXISTS id_modalidad_estudio BIGINT,
    ADD COLUMN IF NOT EXISTS articulo_legal VARCHAR(40),
    ADD COLUMN IF NOT EXISTS creditos_minimos INTEGER,
    ADD COLUMN IF NOT EXISTS requiere_pago BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS dias_habiles_limite INTEGER,
    ADD COLUMN IF NOT EXISTS max_veces_desaprobado INTEGER;

UPDATE tipos_matricula SET articulo_legal = 'Art. 87.1', creditos_minimos = NULL, requiere_pago = true, dias_habiles_limite = NULL, max_veces_desaprobado = NULL WHERE codigo = 'MAT-001';
UPDATE tipos_matricula SET articulo_legal = 'Art. 87.2', creditos_minimos = NULL, requiere_pago = true, dias_habiles_limite = 7, max_veces_desaprobado = NULL WHERE codigo = 'MAT-002';
UPDATE tipos_matricula SET articulo_legal = NULL, creditos_minimos = 12, requiere_pago = true, dias_habiles_limite = NULL, max_veces_desaprobado = NULL WHERE codigo = 'MAT-003';
UPDATE tipos_matricula SET articulo_legal = NULL, creditos_minimos = NULL, requiere_pago = true, dias_habiles_limite = NULL, max_veces_desaprobado = NULL WHERE codigo = 'MAT-004';
UPDATE tipos_matricula SET articulo_legal = 'Art. 86.3.1 y 122', creditos_minimos = NULL, requiere_pago = false, dias_habiles_limite = NULL, max_veces_desaprobado = NULL WHERE codigo = 'MAT-005';
UPDATE tipos_matricula SET articulo_legal = 'Art. 86.3.2', creditos_minimos = NULL, requiere_pago = true, dias_habiles_limite = NULL, max_veces_desaprobado = NULL WHERE codigo = 'MAT-006';
UPDATE tipos_matricula SET articulo_legal = NULL, creditos_minimos = NULL, requiere_pago = true, dias_habiles_limite = NULL, max_veces_desaprobado = 3 WHERE codigo = 'MAT-007';
UPDATE tipos_matricula SET articulo_legal = NULL, creditos_minimos = NULL, requiere_pago = true, dias_habiles_limite = NULL, max_veces_desaprobado = NULL WHERE codigo = 'MAT-008';
UPDATE tipos_matricula SET articulo_legal = NULL, creditos_minimos = NULL, requiere_pago = true, dias_habiles_limite = NULL, max_veces_desaprobado = NULL WHERE codigo = 'MAT-009';
UPDATE tipos_matricula SET articulo_legal = NULL, creditos_minimos = NULL, requiere_pago = true, dias_habiles_limite = NULL, max_veces_desaprobado = NULL WHERE codigo = 'MAT-010';
