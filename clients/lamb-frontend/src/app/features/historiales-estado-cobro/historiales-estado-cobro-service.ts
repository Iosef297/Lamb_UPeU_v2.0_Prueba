import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HistorialesEstadoCobroRequest, HistorialesEstadoCobroResponse } from './historiales-estado-cobro.model';

@Injectable({ providedIn: 'root' })
export class HistorialesEstadoCobroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cobros/historiales-estado-cobro`;

  listar(): Observable<HistorialesEstadoCobroResponse[]> {
    return this.http.get<HistorialesEstadoCobroResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<HistorialesEstadoCobroResponse> {
    return this.http.get<HistorialesEstadoCobroResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: HistorialesEstadoCobroRequest): Observable<HistorialesEstadoCobroResponse> {
    return this.http.post<HistorialesEstadoCobroResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: HistorialesEstadoCobroRequest): Observable<HistorialesEstadoCobroResponse> {
    return this.http.put<HistorialesEstadoCobroResponse>(`${this.baseUrl}/${id}`, request);
  }
}
