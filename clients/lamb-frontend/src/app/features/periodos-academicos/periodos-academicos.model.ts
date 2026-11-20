export type EstadoPeriodo = 'PLANIFICADO' | 'EN_CURSO' | 'CERRADO';

export interface PeriodosAcademicosRequest {
  id?: number;
  codigo: string;
  nombre: string;
  idTipoPeriodo: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPeriodo;
}

export interface PeriodosAcademicosResponse {
  id: number;
  codigo: string;
  nombre: string;
  idTipoPeriodo: number;
  codigoTipoPeriodo: string;
  nombreTipoPeriodo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPeriodo;
}
