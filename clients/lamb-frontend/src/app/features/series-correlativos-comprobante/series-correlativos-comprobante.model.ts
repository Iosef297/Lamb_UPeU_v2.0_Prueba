export interface SeriesCorrelativosComprobanteRequest {
  id?: number;
  tipoDocumento: string;
  serie: string;
  correlativoActual: number;
}

export interface SeriesCorrelativosComprobanteResponse {
  id: number;
  tipoDocumento: string;
  serie: string;
  correlativoActual: number;
}
