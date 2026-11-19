CREATE TABLE IF NOT EXISTS personas_admision (
    id BIGSERIAL PRIMARY KEY,
    dni VARCHAR(15) NOT NULL,
    nombres VARCHAR(100),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE,
    sexo VARCHAR(20),
    correo VARCHAR(100),
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP NOT NULL,
    CONSTRAINT uk_personas_admision_dni UNIQUE (dni)
);
