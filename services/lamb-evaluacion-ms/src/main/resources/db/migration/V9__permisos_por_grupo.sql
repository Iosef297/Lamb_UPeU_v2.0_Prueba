-- Permisos por grupo del LAMB real (puede_editar_notas, gestiona_asistencia): solo restringen al docente
ALTER TABLE actas ADD COLUMN IF NOT EXISTS notas_habilitadas BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE actas ADD COLUMN IF NOT EXISTS asistencia_habilitada BOOLEAN NOT NULL DEFAULT true;
