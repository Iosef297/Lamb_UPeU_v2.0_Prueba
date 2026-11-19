export interface AnulacionesMasivasImpagoRequest {
  id?: number;
  periodo: string;
  totalMatriculasAnuladas: number;
  motivo: string;
  fechaEjecucion: string;
}

export interface AnulacionesMasivasImpagoResponse {
  id: number;
  periodo: string;
  totalMatriculasAnuladas: number;
  motivo: string;
  fechaEjecucion: string;
}
