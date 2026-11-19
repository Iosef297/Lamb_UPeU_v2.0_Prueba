export interface DescuentosAplicadosRequest {
  id?: number;
  idPersona: number;
  idTipoDescuento: number;
  periodo: string;
  monto: number;
}

export interface DescuentosAplicadosResponse {
  id: number;
  idPersona: number;
  idTipoDescuento: number;
  periodo: string;
  monto: number;
}
