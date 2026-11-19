export interface CargasMinimasAutorizadasRequest {
  id?: number;
  idMatricula: number;
  creditosMinimos: number;
  motivo: string;
  fechaAutorizacion: string;
}

export interface CargasMinimasAutorizadasResponse {
  id: number;
  idMatricula: number;
  creditosMinimos: number;
  motivo: string;
  fechaAutorizacion: string;
}
