export interface TiposBecaRequest {
  id?: number;
  nombre: string;
  porcentajeCobertura: number;
  descripcion?: string;
}

export interface TiposBecaResponse {
  id: number;
  nombre: string;
  porcentajeCobertura: number;
  descripcion: string;
}
