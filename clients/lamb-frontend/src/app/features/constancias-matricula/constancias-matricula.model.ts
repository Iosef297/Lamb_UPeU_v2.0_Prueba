export interface ConstanciasMatriculaRequest {
  id?: number;
  idMatricula: number;
  fechaEmision: string;
  codigoVerificacion: string;
  urlDocumento?: string;
}

export interface ConstanciasMatriculaResponse {
  id: number;
  idMatricula: number;
  fechaEmision: string;
  codigoVerificacion: string;
  urlDocumento: string;
}
