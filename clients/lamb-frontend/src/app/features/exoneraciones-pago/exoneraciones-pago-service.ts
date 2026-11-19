import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExoneracionesPagoRequest, ExoneracionesPagoResponse } from './exoneraciones-pago.model';

@Injectable({ providedIn: 'root' })
export class ExoneracionesPagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/descuentos-becas/exoneraciones-pago`;

  listar(): Observable<ExoneracionesPagoResponse[]> {
    return this.http.get<ExoneracionesPagoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ExoneracionesPagoResponse> {
    return this.http.get<ExoneracionesPagoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ExoneracionesPagoRequest): Observable<ExoneracionesPagoResponse> {
    return this.http.post<ExoneracionesPagoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ExoneracionesPagoRequest): Observable<ExoneracionesPagoResponse> {
    return this.http.put<ExoneracionesPagoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
