export interface RehabilitacionesMatriculaRequest {
  id?: number;
  idMatricula: number;
  motivo: string;
  fechaRehabilitacion: string;
}

export interface RehabilitacionesMatriculaResponse {
  id: number;
  idMatricula: number;
  motivo: string;
  fechaRehabilitacion: string;
}
