export interface ConstanciasNoAdeudoRequest {
  id?: number;
  idPersona: number;
  fechaEmision: string;
  codigoVerificacion: string;
  urlDocumento?: string;
}

export interface ConstanciasNoAdeudoResponse {
  id: number;
  idPersona: number;
  fechaEmision: string;
  codigoVerificacion: string;
  urlDocumento: string;
}
