export interface CronogramasVencimientoRequest {
  id?: number;
  periodo: string;
  fechaVencimiento: string;
  descripcion?: string;
}

export interface CronogramasVencimientoResponse {
  id: number;
  periodo: string;
  fechaVencimiento: string;
  descripcion: string;
}
