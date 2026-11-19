import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RetirosInasistenciaRequest, RetirosInasistenciaResponse } from './retiros-inasistencia.model';

@Injectable({ providedIn: 'root' })
export class RetirosInasistenciaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/rectificacion-retiro-reactivacion/retiros-inasistencia`;

  listar(): Observable<RetirosInasistenciaResponse[]> {
    return this.http.get<RetirosInasistenciaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<RetirosInasistenciaResponse> {
    return this.http.get<RetirosInasistenciaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: RetirosInasistenciaRequest): Observable<RetirosInasistenciaResponse> {
    return this.http.post<RetirosInasistenciaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: RetirosInasistenciaRequest): Observable<RetirosInasistenciaResponse> {
    return this.http.put<RetirosInasistenciaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
