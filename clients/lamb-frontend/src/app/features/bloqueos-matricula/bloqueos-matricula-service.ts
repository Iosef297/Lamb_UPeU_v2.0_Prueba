import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BloqueosMatriculaRequest, BloqueosMatriculaResponse } from './bloqueos-matricula.model';

@Injectable({ providedIn: 'root' })
export class BloqueosMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/reglas-requisitos/bloqueos`;

  listar(): Observable<BloqueosMatriculaResponse[]> {
    return this.http.get<BloqueosMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<BloqueosMatriculaResponse> {
    return this.http.get<BloqueosMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: BloqueosMatriculaRequest): Observable<BloqueosMatriculaResponse> {
    return this.http.post<BloqueosMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: BloqueosMatriculaRequest): Observable<BloqueosMatriculaResponse> {
    return this.http.put<BloqueosMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }

  levantar(id: number): Observable<BloqueosMatriculaResponse> {
    return this.http.post<BloqueosMatriculaResponse>(`${this.baseUrl}/${id}/levantar`, {});
  }
}
