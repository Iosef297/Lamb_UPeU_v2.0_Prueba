export interface EstudiantesObservadosSuspendidosRequest {
  id?: number;
  idPersona: number;
  tipo: string;
  motivo: string;
  fechaInicio: string;
  fechaFin?: string;
}

export interface EstudiantesObservadosSuspendidosResponse {
  id: number;
  idPersona: number;
  tipo: string;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
}
