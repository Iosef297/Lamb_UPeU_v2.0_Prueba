-- Requisito extracurricular: se exige en horas (1 credito = 20 horas), igual que las actividades de formacion integral.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'requisitos_extracurriculares' AND column_name = 'creditos_exigidos') THEN
        ALTER TABLE requisitos_extracurriculares DROP CONSTRAINT IF EXISTS requisitos_extracurriculares_creditos_exigidos_check;
        ALTER TABLE requisitos_extracurriculares RENAME COLUMN creditos_exigidos TO horas_exigidas;
        UPDATE requisitos_extracurriculares SET horas_exigidas = horas_exigidas * 20;
        ALTER TABLE requisitos_extracurriculares
            ADD CONSTRAINT ck_requisitos_extracurriculares_horas_exigidas CHECK (horas_exigidas BETWEEN 1 AND 400);
    END IF;
END $$;
