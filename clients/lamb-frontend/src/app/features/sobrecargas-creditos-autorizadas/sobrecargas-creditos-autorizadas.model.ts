export interface SobrecargasCreditosAutorizadasRequest {
  id?: number;
  idMatricula: number;
  creditosAutorizados: number;
  motivo: string;
  fechaAutorizacion: string;
}

export interface SobrecargasCreditosAutorizadasResponse {
  id: number;
  idMatricula: number;
  creditosAutorizados: number;
  motivo: string;
  fechaAutorizacion: string;
}
