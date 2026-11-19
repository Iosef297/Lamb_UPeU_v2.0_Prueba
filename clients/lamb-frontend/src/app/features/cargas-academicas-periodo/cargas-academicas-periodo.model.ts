export interface CargasAcademicasPeriodoRequest {
  id?: number;
  idPersona: number;
  periodo: string;
  totalCreditos: number;
  totalCursos: number;
  fechaCalculo: string;
}

export interface CargasAcademicasPeriodoResponse {
  id: number;
  idPersona: number;
  periodo: string;
  totalCreditos: number;
  totalCursos: number;
  fechaCalculo: string;
}
