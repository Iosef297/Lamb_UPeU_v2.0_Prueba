export interface ReclamosPagoRequest {
  id?: number;
  idPersona: number;
  idPago?: number;
  motivo: string;
  estado?: string;
  fechaReclamo: string;
}

export interface ReclamosPagoResponse {
  id: number;
  idPersona: number;
  idPago: number;
  motivo: string;
  estado: string;
  fechaReclamo: string;
}
