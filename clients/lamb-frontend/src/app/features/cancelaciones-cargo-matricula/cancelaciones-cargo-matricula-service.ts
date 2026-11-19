import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CancelacionesCargoMatriculaRequest, CancelacionesCargoMatriculaResponse } from './cancelaciones-cargo-matricula.model';

@Injectable({ providedIn: 'root' })
export class CancelacionesCargoMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/reembolsos-cancelaciones/cancelaciones-cargo-matricula`;

  listar(): Observable<CancelacionesCargoMatriculaResponse[]> {
    return this.http.get<CancelacionesCargoMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CancelacionesCargoMatriculaResponse> {
    return this.http.get<CancelacionesCargoMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CancelacionesCargoMatriculaRequest): Observable<CancelacionesCargoMatriculaResponse> {
    return this.http.post<CancelacionesCargoMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CancelacionesCargoMatriculaRequest): Observable<CancelacionesCargoMatriculaResponse> {
    return this.http.put<CancelacionesCargoMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
