export interface IntentosCursoRequest {
  id?: number;
  idPersona: number;
  idCurso: number;
  numeroIntento: number;
  periodo: string;
  fechaRegistro: string;
}

export interface IntentosCursoResponse {
  id: number;
  idPersona: number;
  idCurso: number;
  numeroIntento: number;
  periodo: string;
  fechaRegistro: string;
}
