export interface AmpliacionesPlazoMatriculaRequest {
  id?: number;
  idCronograma: number;
  fechaAmpliada: string;
  motivo?: string;
  autorizadoPor?: string;
}

export interface AmpliacionesPlazoMatriculaResponse {
  id: number;
  idCronograma: number;
  fechaAmpliada: string;
  motivo: string;
  autorizadoPor: string;
}
