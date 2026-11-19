import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ObservacionesMatriculaRequest, ObservacionesMatriculaResponse } from './observaciones-matricula.model';

@Injectable({ providedIn: 'root' })
export class ObservacionesMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/matriculas/observaciones`;

  listar(): Observable<ObservacionesMatriculaResponse[]> {
    return this.http.get<ObservacionesMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ObservacionesMatriculaResponse> {
    return this.http.get<ObservacionesMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ObservacionesMatriculaRequest): Observable<ObservacionesMatriculaResponse> {
    return this.http.post<ObservacionesMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ObservacionesMatriculaRequest): Observable<ObservacionesMatriculaResponse> {
    return this.http.put<ObservacionesMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
