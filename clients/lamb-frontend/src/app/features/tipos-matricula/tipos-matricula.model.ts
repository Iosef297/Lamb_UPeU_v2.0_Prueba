export interface TiposMatriculaRequest {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface TiposMatriculaResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
