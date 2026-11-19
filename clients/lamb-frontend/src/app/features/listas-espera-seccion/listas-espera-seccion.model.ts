export interface ListasEsperaSeccionRequest {
  id?: number;
  idSeccion: number;
  idPersona: number;
  posicion: number;
  fechaInscripcion: string;
}

export interface ListasEsperaSeccionResponse {
  id: number;
  idSeccion: number;
  idPersona: number;
  posicion: number;
  fechaInscripcion: string;
}
