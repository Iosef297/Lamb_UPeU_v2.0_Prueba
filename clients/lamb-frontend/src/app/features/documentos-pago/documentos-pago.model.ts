export interface DocumentosPagoRequest {
  id?: number;
  idPago: number;
  tipoDocumento: string;
  numero: string;
  fechaEmision: string;
  urlDocumento?: string;
}

export interface DocumentosPagoResponse {
  id: number;
  idPago: number;
  tipoDocumento: string;
  numero: string;
  fechaEmision: string;
  urlDocumento: string;
}
