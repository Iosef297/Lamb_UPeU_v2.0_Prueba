export interface SituacionesAcademicasEstudianteRequest {
  id?: number;
  idPersona: number;
  periodo: string;
  situacion: string;
  fechaRegistro: string;
}

export interface SituacionesAcademicasEstudianteResponse {
  id: number;
  idPersona: number;
  periodo: string;
  situacion: string;
  fechaRegistro: string;
}
