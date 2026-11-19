export interface MovimientosRequest {
  id?: number;
  idCuenta: number;
  tipo: string;
  monto: number;
  fechaMovimiento: string;
  descripcion?: string;
}

export interface MovimientosResponse {
  id: number;
  idCuenta: number;
  tipo: string;
  monto: number;
  fechaMovimiento: string;
  descripcion: string;
}
