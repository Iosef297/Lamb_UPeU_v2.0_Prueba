export interface BecasAplicadasRequest {
  id?: number;
  idPersona: number;
  idTipoBeca: number;
  periodo: string;
  estado?: string;
}

export interface BecasAplicadasResponse {
  id: number;
  idPersona: number;
  idTipoBeca: number;
  periodo: string;
  estado: string;
}
