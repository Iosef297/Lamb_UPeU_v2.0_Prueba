export interface RetirosInasistenciaRequest {
  id?: number;
  idMatricula: number;
  numeroInasistencias: number;
  fechaRetiro: string;
}

export interface RetirosInasistenciaResponse {
  id: number;
  idMatricula: number;
  numeroInasistencias: number;
  fechaRetiro: string;
}
