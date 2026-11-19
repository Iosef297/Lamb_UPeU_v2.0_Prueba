import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnulacionesComprobanteRequest, AnulacionesComprobanteResponse } from './anulaciones-comprobante.model';

@Injectable({ providedIn: 'root' })
export class AnulacionesComprobanteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/comprobantes/anulaciones-comprobante`;

  listar(): Observable<AnulacionesComprobanteResponse[]> {
    return this.http.get<AnulacionesComprobanteResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<AnulacionesComprobanteResponse> {
    return this.http.get<AnulacionesComprobanteResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: AnulacionesComprobanteRequest): Observable<AnulacionesComprobanteResponse> {
    return this.http.post<AnulacionesComprobanteResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: AnulacionesComprobanteRequest): Observable<AnulacionesComprobanteResponse> {
    return this.http.put<AnulacionesComprobanteResponse>(`${this.baseUrl}/${id}`, request);
  }
}
