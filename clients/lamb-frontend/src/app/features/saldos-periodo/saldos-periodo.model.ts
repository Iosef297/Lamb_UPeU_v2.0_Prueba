export interface SaldosPeriodoRequest {
  id?: number;
  idPersona: number;
  periodo: string;
  saldoInicial?: number;
  saldoFinal?: number;
}

export interface SaldosPeriodoResponse {
  id: number;
  idPersona: number;
  periodo: string;
  saldoInicial: number;
  saldoFinal: number;
}
