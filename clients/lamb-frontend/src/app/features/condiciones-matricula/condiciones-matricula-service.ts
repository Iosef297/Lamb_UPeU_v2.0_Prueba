import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CondicionesMatriculaRequest, CondicionesMatriculaResponse } from './condiciones-matricula.model';

@Injectable({ providedIn: 'root' })
export class CondicionesMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/situacion-estudiante/condiciones`;

  listar(): Observable<CondicionesMatriculaResponse[]> {
    return this.http.get<CondicionesMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CondicionesMatriculaResponse> {
    return this.http.get<CondicionesMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CondicionesMatriculaRequest): Observable<CondicionesMatriculaResponse> {
    return this.http.post<CondicionesMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CondicionesMatriculaRequest): Observable<CondicionesMatriculaResponse> {
    return this.http.put<CondicionesMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
