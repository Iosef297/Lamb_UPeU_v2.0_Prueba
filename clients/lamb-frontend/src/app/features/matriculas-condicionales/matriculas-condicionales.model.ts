export interface MatriculasCondicionalesRequest {
  id?: number;
  idMatricula: number;
  motivo: string;
  fechaCondicion: string;
  levantada?: boolean;
}

export interface MatriculasCondicionalesResponse {
  id: number;
  idMatricula: number;
  motivo: string;
  fechaCondicion: string;
  levantada: boolean;
}
