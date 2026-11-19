export interface ReactivacionesMatriculaAnuladaRequest {
  id?: number;
  idMatricula: number;
  motivo: string;
  fechaReactivacion: string;
}

export interface ReactivacionesMatriculaAnuladaResponse {
  id: number;
  idMatricula: number;
  motivo: string;
  fechaReactivacion: string;
}
