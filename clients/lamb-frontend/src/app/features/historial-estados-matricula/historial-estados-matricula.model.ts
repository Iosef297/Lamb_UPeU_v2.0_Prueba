export interface HistorialEstadosMatriculaRequest {
  id?: number;
  idMatricula: number;
  estadoAnterior?: string;
  estadoNuevo: string;
  fechaCambio: string;
  observacion?: string;
}

export interface HistorialEstadosMatriculaResponse {
  id: number;
  idMatricula: number;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaCambio: string;
  observacion: string;
}
