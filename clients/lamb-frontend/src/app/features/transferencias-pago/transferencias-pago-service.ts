import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransferenciasPagoRequest, TransferenciasPagoResponse } from './transferencias-pago.model';

@Injectable({ providedIn: 'root' })
export class TransferenciasPagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/reembolsos-cancelaciones/transferencias-pago`;

  listar(): Observable<TransferenciasPagoResponse[]> {
    return this.http.get<TransferenciasPagoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<TransferenciasPagoResponse> {
    return this.http.get<TransferenciasPagoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: TransferenciasPagoRequest): Observable<TransferenciasPagoResponse> {
    return this.http.post<TransferenciasPagoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: TransferenciasPagoRequest): Observable<TransferenciasPagoResponse> {
    return this.http.put<TransferenciasPagoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
