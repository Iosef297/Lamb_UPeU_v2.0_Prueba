export interface NotasCreditoRequest {
  id?: number;
  idDocumentoPago: number;
  motivo: string;
  monto: number;
  fechaEmision: string;
}

export interface NotasCreditoResponse {
  id: number;
  idDocumentoPago: number;
  motivo: string;
  monto: number;
  fechaEmision: string;
}
