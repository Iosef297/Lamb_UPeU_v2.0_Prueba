export interface BloqueosMatriculaRequest {
  id?: number;
  idPersona: number;
  motivo?: string;
  fechaInicio: string;
  fechaFin?: string;
  activo?: boolean;
}

export interface BloqueosMatriculaResponse {
  id: number;
  idPersona: number;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}
