import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReclamosPagoRequest, ReclamosPagoResponse } from './reclamos-pago.model';

@Injectable({ providedIn: 'root' })
export class ReclamosPagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/control-cierre/reclamos-pago`;

  listar(): Observable<ReclamosPagoResponse[]> {
    return this.http.get<ReclamosPagoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ReclamosPagoResponse> {
    return this.http.get<ReclamosPagoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ReclamosPagoRequest): Observable<ReclamosPagoResponse> {
    return this.http.post<ReclamosPagoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ReclamosPagoRequest): Observable<ReclamosPagoResponse> {
    return this.http.put<ReclamosPagoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
