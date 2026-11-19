export interface CondicionesMatriculaRequest {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface CondicionesMatriculaResponse {
  id: number;
  nombre: string;
  descripcion: string;
}
