-- lamb-finanzas-ms es el dueno canonico de Becas (TipoBeca/BecaAplicada/RenovacionSuspensionBeca,
-- items 31/32/33 del documento), Convenios institucionales con descuento (item 35) y Comprobantes
-- (SerieCorrelativoComprobante/TipoDocumentoPago, items 37/38). Estas tablas de lamb-ingresos-pagos-ms
-- quedan huerfanas y se eliminan.
ALTER TABLE becas_asignadas DROP CONSTRAINT IF EXISTS becas_asignadas_id_beca_fkey;
ALTER TABLE series_comprobante DROP CONSTRAINT IF EXISTS series_comprobante_id_tipo_comprobante_fkey;

DROP TABLE IF EXISTS becas_asignadas;
DROP TABLE IF EXISTS becas;
DROP TABLE IF EXISTS convenios_institucionales;
DROP TABLE IF EXISTS series_comprobante;
DROP TABLE IF EXISTS tipos_comprobante;
