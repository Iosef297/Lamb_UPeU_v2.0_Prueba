export interface TiposPeriodoRequest {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface TiposPeriodoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}
