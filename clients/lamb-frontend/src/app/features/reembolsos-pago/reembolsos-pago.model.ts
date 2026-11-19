export interface ReembolsosPagoRequest {
  id?: number;
  idPago: number;
  montoReembolsado: number;
  fechaReembolso: string;
  estado?: string;
}

export interface ReembolsosPagoResponse {
  id: number;
  idPago: number;
  montoReembolsado: number;
  fechaReembolso: string;
  estado: string;
}
