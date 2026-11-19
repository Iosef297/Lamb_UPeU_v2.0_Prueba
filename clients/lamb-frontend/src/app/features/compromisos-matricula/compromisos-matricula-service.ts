import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompromisosMatriculaRequest, CompromisosMatriculaResponse } from './compromisos-matricula.model';

@Injectable({ providedIn: 'root' })
export class CompromisosMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/reglas-requisitos/compromisos`;

  listar(): Observable<CompromisosMatriculaResponse[]> {
    return this.http.get<CompromisosMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CompromisosMatriculaResponse> {
    return this.http.get<CompromisosMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CompromisosMatriculaRequest): Observable<CompromisosMatriculaResponse> {
    return this.http.post<CompromisosMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CompromisosMatriculaRequest): Observable<CompromisosMatriculaResponse> {
    return this.http.put<CompromisosMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
