import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoRequest, PagoResponse } from './pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/pagos`;

  listar(): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<PagoResponse> {
    return this.http.get<PagoResponse>(`${this.baseUrl}/${id}`);
  }

  procesar(request: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(this.baseUrl, request);
  }

  // Confirma un pago EN_PROCESO (el metodo ya quedo fijado al crear el pago).
  aceptar(id: number): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.baseUrl}/${id}/aceptar`, {});
  }

  rechazar(id: number): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.baseUrl}/${id}/rechazar`, {});
  }

  reembolsar(id: number): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.baseUrl}/${id}/reembolsar`, {});
  }
}
