export interface LiberacionesExcepcionalesPrerrequisitoRequest {
  id?: number;
  idPersona: number;
  idCurso: number;
  idPrerrequisito: number;
  motivo: string;
  fechaAutorizacion: string;
}

export interface LiberacionesExcepcionalesPrerrequisitoResponse {
  id: number;
  idPersona: number;
  idCurso: number;
  idPrerrequisito: number;
  motivo: string;
  fechaAutorizacion: string;
}
