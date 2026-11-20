ALTER TABLE periodos_academicos
    ADD COLUMN id_regimen_academico BIGINT REFERENCES regimenes_academicos (id);
