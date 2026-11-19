export interface CompromisosMatriculaRequest {
  id?: number;
  idMatricula: number;
  montoComprometido: number;
  fechaFirma: string;
  documentoUrl?: string;
}

export interface CompromisosMatriculaResponse {
  id: number;
  idMatricula: number;
  montoComprometido: number;
  fechaFirma: string;
  documentoUrl: string;
}
