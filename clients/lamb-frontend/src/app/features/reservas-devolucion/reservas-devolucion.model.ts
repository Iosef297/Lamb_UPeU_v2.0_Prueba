export interface ReservasDevolucionRequest {
  id?: number;
  idCuenta: number;
  monto: number;
  motivo?: string;
  fechaReserva: string;
}

export interface ReservasDevolucionResponse {
  id: number;
  idCuenta: number;
  monto: number;
  motivo: string;
  fechaReserva: string;
}
