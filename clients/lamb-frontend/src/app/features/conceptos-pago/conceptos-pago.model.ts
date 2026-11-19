export interface ConceptosPagoRequest {
  id?: number;
  idCategoriaConcepto: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ConceptosPagoResponse {
  id: number;
  idCategoriaConcepto: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
