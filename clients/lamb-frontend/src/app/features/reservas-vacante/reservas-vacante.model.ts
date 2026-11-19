export interface ReservasVacanteRequest {
  id?: number;
  idSeccion: number;
  idPersona: number;
  fechaReserva: string;
  vigenciaHasta?: string;
  estado?: string;
}

export interface ReservasVacanteResponse {
  id: number;
  idSeccion: number;
  idPersona: number;
  fechaReserva: string;
  vigenciaHasta: string;
  estado: string;
}
