export interface AmpliacionesCupoRequest {
  id?: number;
  idSeccion: number;
  cupoAdicional: number;
  motivo?: string;
  autorizadoPor?: string;
}

export interface AmpliacionesCupoResponse {
  id: number;
  idSeccion: number;
  cupoAdicional: number;
  motivo: string;
  autorizadoPor: string;
}
