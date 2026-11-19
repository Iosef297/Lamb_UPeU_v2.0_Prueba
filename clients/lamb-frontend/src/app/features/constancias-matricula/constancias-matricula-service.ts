import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConstanciasMatriculaRequest, ConstanciasMatriculaResponse } from './constancias-matricula.model';

@Injectable({ providedIn: 'root' })
export class ConstanciasMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/matriculas/constancias`;

  listar(): Observable<ConstanciasMatriculaResponse[]> {
    return this.http.get<ConstanciasMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ConstanciasMatriculaResponse> {
    return this.http.get<ConstanciasMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ConstanciasMatriculaRequest): Observable<ConstanciasMatriculaResponse> {
    return this.http.post<ConstanciasMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ConstanciasMatriculaRequest): Observable<ConstanciasMatriculaResponse> {
    return this.http.put<ConstanciasMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
