export interface SolicitudesRectificacionRequest {
  id?: number;
  idMatricula: number;
  motivo: string;
  estado: string;
  fechaSolicitud: string;
}

export interface SolicitudesRectificacionResponse {
  id: number;
  idMatricula: number;
  motivo: string;
  estado: string;
  fechaSolicitud: string;
}
