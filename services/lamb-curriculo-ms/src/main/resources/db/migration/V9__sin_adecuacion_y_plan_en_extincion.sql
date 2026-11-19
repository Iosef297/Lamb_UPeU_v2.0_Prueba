-- Cada estudiante termina con el plan con el que ingreso: se elimina el "plan de adecuacion" (cambio masivo de plan).
DROP TABLE IF EXISTS planes_adecuacion;

-- Un plan reemplazado ya no se "deroga": pasa a EN_EXTINCION (cerrado a nuevo ingreso, sigue con sus cohortes).
-- DEROGADO queda solo para el cierre definitivo, cuando ya no quedan estudiantes con ese plan.
UPDATE planes_estudio SET estado = 'EN_EXTINCION' WHERE estado = 'DEROGADO';
