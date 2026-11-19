export interface RequisitosPorTipoMatriculaRequest {
  id?: number;
  idTipoMatricula: number;
  idRequisitoCurriculo: number;
  descripcion?: string;
  obligatorio?: boolean;
}

export interface RequisitosPorTipoMatriculaResponse {
  id: number;
  idTipoMatricula: number;
  idRequisitoCurriculo: number;
  descripcion: string;
  obligatorio: boolean;
}
