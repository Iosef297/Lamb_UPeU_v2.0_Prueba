CREATE TABLE IF NOT EXISTS sedes (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL,
    CONSTRAINT uk_sedes_codigo UNIQUE (codigo)
);

CREATE TABLE IF NOT EXISTS programas_academicos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    facultad VARCHAR(100) NOT NULL,
    id_sede BIGINT NOT NULL,
    activo BOOLEAN NOT NULL,
    CONSTRAINT uk_programas_academicos_codigo UNIQUE (codigo),
    CONSTRAINT fk_programas_academicos_sede FOREIGN KEY (id_sede) REFERENCES sedes(id)
);
