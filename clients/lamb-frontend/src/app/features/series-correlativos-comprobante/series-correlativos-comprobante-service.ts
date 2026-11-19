import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SeriesCorrelativosComprobanteRequest, SeriesCorrelativosComprobanteResponse } from './series-correlativos-comprobante.model';

@Injectable({ providedIn: 'root' })
export class SeriesCorrelativosComprobanteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/comprobantes/series-correlativos-comprobante`;

  listar(): Observable<SeriesCorrelativosComprobanteResponse[]> {
    return this.http.get<SeriesCorrelativosComprobanteResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<SeriesCorrelativosComprobanteResponse> {
    return this.http.get<SeriesCorrelativosComprobanteResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: SeriesCorrelativosComprobanteRequest): Observable<SeriesCorrelativosComprobanteResponse> {
    return this.http.post<SeriesCorrelativosComprobanteResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: SeriesCorrelativosComprobanteRequest): Observable<SeriesCorrelativosComprobanteResponse> {
    return this.http.put<SeriesCorrelativosComprobanteResponse>(`${this.baseUrl}/${id}`, request);
  }
}
