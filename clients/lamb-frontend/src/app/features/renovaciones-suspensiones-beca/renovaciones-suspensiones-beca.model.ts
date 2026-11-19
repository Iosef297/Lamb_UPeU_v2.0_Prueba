export interface RenovacionesSuspensionesBecaRequest {
  id?: number;
  idBecaAplicada: number;
  tipo: string;
  motivo?: string;
  fecha: string;
}

export interface RenovacionesSuspensionesBecaResponse {
  id: number;
  idBecaAplicada: number;
  tipo: string;
  motivo: string;
  fecha: string;
}
