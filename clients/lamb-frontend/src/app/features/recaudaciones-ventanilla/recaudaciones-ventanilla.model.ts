export interface RecaudacionesVentanillaRequest {
  id?: number;
  idPago: number;
  idPuntoRecaudacion?: number;
  cajero?: string;
  fechaRegistro: string;
}

export interface RecaudacionesVentanillaResponse {
  id: number;
  idPago: number;
  idPuntoRecaudacion: number;
  cajero: string;
  fechaRegistro: string;
}
