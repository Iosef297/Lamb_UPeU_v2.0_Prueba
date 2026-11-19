export interface DatosFacturacionClienteRequest {
  id?: number;
  idPersona: number;
  razonSocial?: string;
  numeroDocumento: string;
  direccion?: string;
}

export interface DatosFacturacionClienteResponse {
  id: number;
  idPersona: number;
  razonSocial: string;
  numeroDocumento: string;
  direccion: string;
}
