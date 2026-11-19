import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RequisitosPorTipoMatriculaRequest, RequisitosPorTipoMatriculaResponse } from './requisitos-por-tipo-matricula.model';

@Injectable({ providedIn: 'root' })
export class RequisitosPorTipoMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/reglas-requisitos/requisitos-por-tipo`;

  listar(): Observable<RequisitosPorTipoMatriculaResponse[]> {
    return this.http.get<RequisitosPorTipoMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<RequisitosPorTipoMatriculaResponse> {
    return this.http.get<RequisitosPorTipoMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: RequisitosPorTipoMatriculaRequest): Observable<RequisitosPorTipoMatriculaResponse> {
    return this.http.post<RequisitosPorTipoMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: RequisitosPorTipoMatriculaRequest): Observable<RequisitosPorTipoMatriculaResponse> {
    return this.http.put<RequisitosPorTipoMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
