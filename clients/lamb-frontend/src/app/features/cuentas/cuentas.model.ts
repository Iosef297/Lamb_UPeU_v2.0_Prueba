export interface CuentasRequest {
  id?: number;
  idPersona: number;
  saldo: number;
  estado: string;
}

export interface CuentasResponse {
  id: number;
  idPersona: number;
  saldo: number;
  estado: string;
}
