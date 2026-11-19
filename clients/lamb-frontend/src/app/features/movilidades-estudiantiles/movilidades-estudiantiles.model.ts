export interface MovilidadesEstudiantilesRequest {
  id?: number;
  idPersona: number;
  institucionDestino: string;
  tipoMovilidad: string;
  periodo: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
}

export interface MovilidadesEstudiantilesResponse {
  id: number;
  idPersona: number;
  institucionDestino: string;
  tipoMovilidad: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}
