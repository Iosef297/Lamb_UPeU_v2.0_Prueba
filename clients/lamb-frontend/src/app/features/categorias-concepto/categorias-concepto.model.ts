export interface CategoriasConceptoRequest {
  id?: number;
  codigo: string;
  nombre: string;
  activo?: boolean;
}

export interface CategoriasConceptoResponse {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}
