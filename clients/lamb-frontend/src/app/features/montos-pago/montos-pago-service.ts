import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MontosPagoRequest, MontosPagoResponse } from './montos-pago.model';

@Injectable({ providedIn: 'root' })
export class MontosPagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cobros/montos-pago`;

  listar(): Observable<MontosPagoResponse[]> {
    return this.http.get<MontosPagoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<MontosPagoResponse> {
    return this.http.get<MontosPagoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: MontosPagoRequest): Observable<MontosPagoResponse> {
    return this.http.post<MontosPagoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: MontosPagoRequest): Observable<MontosPagoResponse> {
    return this.http.put<MontosPagoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
