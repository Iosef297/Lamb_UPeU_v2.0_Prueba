import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PeriodosAcademicosRequest, PeriodosAcademicosResponse } from './periodos-academicos.model';

@Injectable({ providedIn: 'root' })
export class PeriodosAcademicosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/periodos-academicos`;

  listar(): Observable<PeriodosAcademicosResponse[]> {
    return this.http.get<PeriodosAcademicosResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<PeriodosAcademicosResponse> {
    return this.http.get<PeriodosAcademicosResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: PeriodosAcademicosRequest): Observable<PeriodosAcademicosResponse> {
    return this.http.post<PeriodosAcademicosResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: PeriodosAcademicosRequest): Observable<PeriodosAcademicosResponse> {
    return this.http.put<PeriodosAcademicosResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
