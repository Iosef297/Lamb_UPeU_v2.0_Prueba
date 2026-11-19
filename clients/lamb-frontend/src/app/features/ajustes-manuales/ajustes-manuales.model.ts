export interface AjustesManualesRequest {
  id?: number;
  idCuenta: number;
  monto: number;
  motivo: string;
  autorizadoPor?: string;
  fechaAjuste: string;
}

export interface AjustesManualesResponse {
  id: number;
  idCuenta: number;
  monto: number;
  motivo: string;
  autorizadoPor: string;
  fechaAjuste: string;
}
