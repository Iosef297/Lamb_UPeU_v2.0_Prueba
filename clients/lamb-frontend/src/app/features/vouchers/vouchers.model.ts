export interface VouchersRequest {
  id?: number;
  idPago: number;
  numeroVoucher: string;
  entidadFinanciera?: string;
  fechaRegistro: string;
}

export interface VouchersResponse {
  id: number;
  idPago: number;
  numeroVoucher: string;
  entidadFinanciera: string;
  fechaRegistro: string;
}
