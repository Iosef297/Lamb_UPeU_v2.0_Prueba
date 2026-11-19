export interface MontosPagoRequest {
  id?: number;
  idDetalleCobro: number;
  idPago: number;
  monto: number;
}

export interface MontosPagoResponse {
  id: number;
  idDetalleCobro: number;
  idPago: number;
  monto: number;
}
