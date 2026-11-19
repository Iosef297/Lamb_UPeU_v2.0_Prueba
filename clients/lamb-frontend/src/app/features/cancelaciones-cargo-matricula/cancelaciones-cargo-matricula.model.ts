export interface CancelacionesCargoMatriculaRequest {
  id?: number;
  idMatricula: number;
  motivo: string;
  fechaCancelacion: string;
}

export interface CancelacionesCargoMatriculaResponse {
  id: number;
  idMatricula: number;
  motivo: string;
  fechaCancelacion: string;
}
