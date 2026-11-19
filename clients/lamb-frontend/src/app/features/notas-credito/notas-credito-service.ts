import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotasCreditoRequest, NotasCreditoResponse } from './notas-credito.model';

@Injectable({ providedIn: 'root' })
export class NotasCreditoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/comprobantes/notas-credito`;

  listar(): Observable<NotasCreditoResponse[]> {
    return this.http.get<NotasCreditoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<NotasCreditoResponse> {
    return this.http.get<NotasCreditoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: NotasCreditoRequest): Observable<NotasCreditoResponse> {
    return this.http.post<NotasCreditoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: NotasCreditoRequest): Observable<NotasCreditoResponse> {
    return this.http.put<NotasCreditoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
