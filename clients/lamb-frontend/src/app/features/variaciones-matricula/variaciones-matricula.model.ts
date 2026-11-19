export interface VariacionesMatriculaRequest {
  id?: number;
  idCronograma: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
}

export interface VariacionesMatriculaResponse {
  id: number;
  idCronograma: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
}
