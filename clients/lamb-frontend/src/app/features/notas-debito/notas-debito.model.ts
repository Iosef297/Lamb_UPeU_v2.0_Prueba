export interface NotasDebitoRequest {
  id?: number;
  idDocumentoPago: number;
  motivo: string;
  monto: number;
  fechaEmision: string;
}

export interface NotasDebitoResponse {
  id: number;
  idDocumentoPago: number;
  motivo: string;
  monto: number;
  fechaEmision: string;
}
