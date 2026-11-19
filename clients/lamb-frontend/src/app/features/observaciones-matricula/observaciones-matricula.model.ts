export interface ObservacionesMatriculaRequest {
  id?: number;
  idMatricula: number;
  observacion: string;
  fechaObservacion: string;
  usuarioRegistro?: string;
}

export interface ObservacionesMatriculaResponse {
  id: number;
  idMatricula: number;
  observacion: string;
  fechaObservacion: string;
  usuarioRegistro: string;
}
