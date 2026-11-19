import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HistorialEstadosMatriculaRequest, HistorialEstadosMatriculaResponse } from './historial-estados-matricula.model';

@Injectable({ providedIn: 'root' })
export class HistorialEstadosMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/matriculas/historial-estados`;

  listar(): Observable<HistorialEstadosMatriculaResponse[]> {
    return this.http.get<HistorialEstadosMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<HistorialEstadosMatriculaResponse> {
    return this.http.get<HistorialEstadosMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: HistorialEstadosMatriculaRequest): Observable<HistorialEstadosMatriculaResponse> {
    return this.http.post<HistorialEstadosMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: HistorialEstadosMatriculaRequest): Observable<HistorialEstadosMatriculaResponse> {
    return this.http.put<HistorialEstadosMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
