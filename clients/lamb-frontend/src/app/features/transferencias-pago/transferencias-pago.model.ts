export interface TransferenciasPagoRequest {
  id?: number;
  idPagoOrigen: number;
  idPagoDestino?: number;
  monto: number;
  motivo?: string;
  fechaTransferencia: string;
}

export interface TransferenciasPagoResponse {
  id: number;
  idPagoOrigen: number;
  idPagoDestino: number;
  monto: number;
  motivo: string;
  fechaTransferencia: string;
}
