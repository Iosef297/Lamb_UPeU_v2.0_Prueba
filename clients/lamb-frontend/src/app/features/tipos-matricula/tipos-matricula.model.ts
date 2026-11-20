export interface TiposMatriculaRequest {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  articuloLegal?: string;
  creditosMinimos?: number;
  requierePago: boolean;
  diasHabilesLimite?: number;
  maxVecesDesaprobado?: number;
}

export interface TiposMatriculaResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  articuloLegal: string;
  creditosMinimos: number;
  requierePago: boolean;
  diasHabilesLimite: number;
  maxVecesDesaprobado: number;
}
