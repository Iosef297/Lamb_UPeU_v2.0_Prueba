export interface CronogramasMatriculaRequest {
  id?: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
}

export interface CronogramasMatriculaResponse {
  id: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
}
