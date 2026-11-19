export interface CambiosSituacionAcademicaRequest {
  id?: number;
  idSituacionAcademica: number;
  situacionAnterior?: string;
  situacionNueva: string;
  resolucion: string;
  fechaCambio: string;
}

export interface CambiosSituacionAcademicaResponse {
  id: number;
  idSituacionAcademica: number;
  situacionAnterior: string;
  situacionNueva: string;
  resolucion: string;
  fechaCambio: string;
}
