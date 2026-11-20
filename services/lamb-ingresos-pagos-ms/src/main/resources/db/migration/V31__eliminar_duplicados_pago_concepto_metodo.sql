-- lamb-finanzas-ms es el dueno canonico de Pago/ConceptoPago/MetodoPago/EstadoPago (saga matricula-finanzas).
-- Aqui solo quedan columnas Long planas (sin FK) hacia esas entidades, siguiendo la convencion
-- de referencia cruzada por id simple ya usada en el resto del proyecto.
ALTER TABLE notas_credito_debito DROP CONSTRAINT IF EXISTS notas_credito_debito_id_pago_fkey;
ALTER TABLE bitacoras_auditoria_pago DROP CONSTRAINT IF EXISTS bitacoras_auditoria_pago_id_pago_fkey;
ALTER TABLE logs_transaccion_pasarela DROP CONSTRAINT IF EXISTS logs_transaccion_pasarela_id_pago_fkey;
ALTER TABLE tarifarios_programa DROP CONSTRAINT IF EXISTS tarifarios_programa_id_concepto_pago_fkey;
ALTER TABLE pagos_concepto DROP CONSTRAINT IF EXISTS pagos_concepto_id_concepto_pago_fkey;
ALTER TABLE pagos_concepto DROP CONSTRAINT IF EXISTS pagos_concepto_id_metodo_pago_fkey;

DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS conceptos_pago;
DROP TABLE IF EXISTS metodos_pago;
