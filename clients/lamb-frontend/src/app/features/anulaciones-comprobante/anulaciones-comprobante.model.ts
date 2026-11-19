export interface AnulacionesComprobanteRequest {
  id?: number;
  idDocumentoPago: number;
  motivo: string;
  fechaAnulacion: string;
}

export interface AnulacionesComprobanteResponse {
  id: number;
  idDocumentoPago: number;
  motivo: string;
  fechaAnulacion: string;
}
