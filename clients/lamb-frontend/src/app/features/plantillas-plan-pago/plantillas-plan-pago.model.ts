export interface PlantillasPlanPagoRequest {
  id?: number;
  nombre: string;
  numeroCuotas: number;
  descripcion?: string;
}

export interface PlantillasPlanPagoResponse {
  id: number;
  nombre: string;
  numeroCuotas: number;
  descripcion: string;
}
