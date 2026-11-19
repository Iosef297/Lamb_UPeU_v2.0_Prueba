import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReactivacionesMatriculaAnuladaRequest, ReactivacionesMatriculaAnuladaResponse } from './reactivaciones-matricula-anulada.model';

@Injectable({ providedIn: 'root' })
export class ReactivacionesMatriculaAnuladaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/rectificacion-retiro-reactivacion/reactivaciones`;

  listar(): Observable<ReactivacionesMatriculaAnuladaResponse[]> {
    return this.http.get<ReactivacionesMatriculaAnuladaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ReactivacionesMatriculaAnuladaResponse> {
    return this.http.get<ReactivacionesMatriculaAnuladaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ReactivacionesMatriculaAnuladaRequest): Observable<ReactivacionesMatriculaAnuladaResponse> {
    return this.http.post<ReactivacionesMatriculaAnuladaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ReactivacionesMatriculaAnuladaRequest): Observable<ReactivacionesMatriculaAnuladaResponse> {
    return this.http.put<ReactivacionesMatriculaAnuladaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
