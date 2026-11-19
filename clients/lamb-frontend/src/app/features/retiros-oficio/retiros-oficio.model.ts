export interface RetirosOficioRequest {
  id?: number;
  idMatricula: number;
  motivo: string;
  fechaRetiro: string;
}

export interface RetirosOficioResponse {
  id: number;
  idMatricula: number;
  motivo: string;
  fechaRetiro: string;
}
