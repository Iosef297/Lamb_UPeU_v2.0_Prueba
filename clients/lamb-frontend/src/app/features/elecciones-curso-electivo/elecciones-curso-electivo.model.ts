export interface EleccionesCursoElectivoRequest {
  id?: number;
  idPersona: number;
  idCurso: number;
  periodo: string;
  fechaEleccion: string;
}

export interface EleccionesCursoElectivoResponse {
  id: number;
  idPersona: number;
  idCurso: number;
  periodo: string;
  fechaEleccion: string;
}
