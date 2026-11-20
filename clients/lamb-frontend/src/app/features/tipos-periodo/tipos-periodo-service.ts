import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TiposPeriodoRequest, TiposPeriodoResponse } from './tipos-periodo.model';

@Injectable({ providedIn: 'root' })
export class TiposPeriodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/tipos-periodo`;

  listar(): Observable<TiposPeriodoResponse[]> {
    return this.http.get<TiposPeriodoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<TiposPeriodoResponse> {
    return this.http.get<TiposPeriodoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: TiposPeriodoRequest): Observable<TiposPeriodoResponse> {
    return this.http.post<TiposPeriodoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: TiposPeriodoRequest): Observable<TiposPeriodoResponse> {
    return this.http.put<TiposPeriodoResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
