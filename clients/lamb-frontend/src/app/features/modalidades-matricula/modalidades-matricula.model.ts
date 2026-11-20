export interface ModalidadesMatriculaRequest {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  idModalidadEstudio?: number;
  articuloLegal?: string;
  creditosMinimos?: number;
  requierePago: boolean;
  diasHabilesLimite?: number;
  maxVecesDesaprobado?: number;
}

export interface ModalidadesMatriculaResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  idModalidadEstudio: number;
  articuloLegal: string;
  creditosMinimos: number;
  requierePago: boolean;
  diasHabilesLimite: number;
  maxVecesDesaprobado: number;
}

export interface ModalidadEstudioResponse {
  id: number;
  nombre: string;
  descripcion: string;
}
