export interface ExoneracionesPagoRequest {
  id?: number;
  idPersona: number;
  idConceptoPago: number;
  motivo: string;
  fechaExoneracion: string;
}

export interface ExoneracionesPagoResponse {
  id: number;
  idPersona: number;
  idConceptoPago: number;
  motivo: string;
  fechaExoneracion: string;
}
