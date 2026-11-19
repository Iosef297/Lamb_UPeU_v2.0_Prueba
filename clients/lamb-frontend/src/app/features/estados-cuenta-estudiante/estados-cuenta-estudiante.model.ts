export interface EstadosCuentaEstudianteRequest {
  id?: number;
  idPersona: number;
  periodo: string;
  saldoFinal: number;
  fechaGeneracion: string;
}

export interface EstadosCuentaEstudianteResponse {
  id: number;
  idPersona: number;
  periodo: string;
  saldoFinal: number;
  fechaGeneracion: string;
}
