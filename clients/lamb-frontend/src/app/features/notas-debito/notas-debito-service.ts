import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotasDebitoRequest, NotasDebitoResponse } from './notas-debito.model';

@Injectable({ providedIn: 'root' })
export class NotasDebitoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/comprobantes/notas-debito`;

  listar(): Observable<NotasDebitoResponse[]> {
    return this.http.get<NotasDebitoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<NotasDebitoResponse> {
    return this.http.get<NotasDebitoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: NotasDebitoRequest): Observable<NotasDebitoResponse> {
    return this.http.post<NotasDebitoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: NotasDebitoRequest): Observable<NotasDebitoResponse> {
    return this.http.put<NotasDebitoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
