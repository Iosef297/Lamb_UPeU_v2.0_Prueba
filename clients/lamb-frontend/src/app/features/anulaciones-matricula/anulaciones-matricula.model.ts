export interface AnulacionesMatriculaRequest {
  id?: number;
  idMatricula: number;
  motivo: string;
  fechaAnulacion: string;
  autorizadoPor?: string;
}

export interface AnulacionesMatriculaResponse {
  id: number;
  idMatricula: number;
  motivo: string;
  fechaAnulacion: string;
  autorizadoPor: string;
}
