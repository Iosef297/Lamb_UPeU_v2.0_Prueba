export interface ModalidadesMatriculaRequest {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ModalidadesMatriculaResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
