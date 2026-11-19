export interface TiposDescuentoRequest {
  id?: number;
  codigo: string;
  nombre: string;
  porcentaje?: number;
}

export interface TiposDescuentoResponse {
  id: number;
  codigo: string;
  nombre: string;
  porcentaje: number;
}
