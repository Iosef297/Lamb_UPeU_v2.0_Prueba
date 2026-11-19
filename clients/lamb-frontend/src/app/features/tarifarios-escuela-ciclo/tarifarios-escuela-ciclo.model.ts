export interface TarifariosEscuelaCicloRequest {
  id?: number;
  idConceptoPago: number;
  idEscuela?: number;
  ciclo: string;
  monto: number;
}

export interface TarifariosEscuelaCicloResponse {
  id: number;
  idConceptoPago: number;
  idEscuela: number;
  ciclo: string;
  monto: number;
}
