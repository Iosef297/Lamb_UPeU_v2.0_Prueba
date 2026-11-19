export interface NotificacionesMatriculaRequest {
  id?: number;
  idMatricula: number;
  tipo: string;
  canal: string;
  fechaEnvio: string;
  estadoEnvio?: string;
}

export interface NotificacionesMatriculaResponse {
  id: number;
  idMatricula: number;
  tipo: string;
  canal: string;
  fechaEnvio: string;
  estadoEnvio: string;
}
