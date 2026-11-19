export interface ConveniosInstitucionalesDescuentoRequest {
  id?: number;
  institucion: string;
  porcentaje: number;
  vigenteDesde?: string;
  vigenteHasta?: string;
}

export interface ConveniosInstitucionalesDescuentoResponse {
  id: number;
  institucion: string;
  porcentaje: number;
  vigenteDesde: string;
  vigenteHasta: string;
}
