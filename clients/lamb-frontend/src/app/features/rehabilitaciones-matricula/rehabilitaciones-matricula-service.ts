import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RehabilitacionesMatriculaRequest, RehabilitacionesMatriculaResponse } from './rehabilitaciones-matricula.model';

@Injectable({ providedIn: 'root' })
export class RehabilitacionesMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/rectificacion-retiro-reactivacion/rehabilitaciones`;

  listar(): Observable<RehabilitacionesMatriculaResponse[]> {
    return this.http.get<RehabilitacionesMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<RehabilitacionesMatriculaResponse> {
    return this.http.get<RehabilitacionesMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: RehabilitacionesMatriculaRequest): Observable<RehabilitacionesMatriculaResponse> {
    return this.http.post<RehabilitacionesMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: RehabilitacionesMatriculaRequest): Observable<RehabilitacionesMatriculaResponse> {
    return this.http.put<RehabilitacionesMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
