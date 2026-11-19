export interface CrucesHorarioAutorizadosRequest {
  id?: number;
  idMatricula: number;
  idSeccion1: number;
  idSeccion2: number;
  motivo: string;
  fechaAutorizacion: string;
}

export interface CrucesHorarioAutorizadosResponse {
  id: number;
  idMatricula: number;
  idSeccion1: number;
  idSeccion2: number;
  motivo: string;
  fechaAutorizacion: string;
}
