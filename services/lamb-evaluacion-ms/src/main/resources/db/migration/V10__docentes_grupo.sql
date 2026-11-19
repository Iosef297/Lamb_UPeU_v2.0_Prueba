-- Copia local de los docentes de cada grupo (llega de planificacion por Kafka: grupo.abierto y grupo.docentes-actualizados).
-- Sirve para validar que el docente que registra notas o asistencia este asignado al grupo y tenga el permiso.
CREATE TABLE IF NOT EXISTS docentes_grupo (
    id                  BIGSERIAL PRIMARY KEY,
    id_grupo            BIGINT      NOT NULL,
    id_docente          BIGINT      NOT NULL,
    rol                 VARCHAR(30) NOT NULL,
    gestiona_nota       BOOLEAN     NOT NULL DEFAULT true,
    gestiona_asistencia BOOLEAN     NOT NULL DEFAULT true,
    CONSTRAINT uk_docentes_grupo UNIQUE (id_grupo, id_docente)
);
CREATE INDEX IF NOT EXISTS ix_docentes_grupo_docente ON docentes_grupo (id_docente);

-- Actas existentes: el titular que ya tenian queda con ambos permisos
INSERT INTO docentes_grupo (id_grupo, id_docente, rol)
SELECT id_grupo, id_docente, 'TITULAR' FROM actas WHERE id_docente IS NOT NULL
ON CONFLICT DO NOTHING;
