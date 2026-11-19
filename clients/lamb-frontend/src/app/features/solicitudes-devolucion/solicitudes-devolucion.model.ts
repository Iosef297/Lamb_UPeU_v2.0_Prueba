export interface SolicitudesDevolucionRequest {
  id?: number;
  idPersona: number;
  motivo: string;
  montoSolicitado: number;
  estado?: string;
  fechaSolicitud: string;
}

export interface SolicitudesDevolucionResponse {
  id: number;
  idPersona: number;
  motivo: string;
  montoSolicitado: number;
  estado: string;
  fechaSolicitud: string;
}
