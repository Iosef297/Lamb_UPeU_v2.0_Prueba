export interface DetallesCobroRequest {
  id?: number;
  idPersona: number;
  idConceptoPago: number;
  monto: number;
  fechaVencimiento: string;
  idEstadoCobro: number;
}

export interface DetallesCobroResponse {
  id: number;
  idPersona: number;
  idConceptoPago: number;
  monto: number;
  fechaVencimiento: string;
  idEstadoCobro: number;
}
