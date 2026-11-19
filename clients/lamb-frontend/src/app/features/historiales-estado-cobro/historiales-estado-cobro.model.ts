export interface HistorialesEstadoCobroRequest {
  id?: number;
  idDetalleCobro: number;
  estadoAnterior?: string;
  estadoNuevo: string;
  fechaCambio: string;
}

export interface HistorialesEstadoCobroResponse {
  id: number;
  idDetalleCobro: number;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaCambio: string;
}
