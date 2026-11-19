import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ModalidadesMatriculaRequest, ModalidadesMatriculaResponse } from './modalidades-matricula.model';

@Injectable({ providedIn: 'root' })
export class ModalidadesMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/calendario-periodos/modalidades`;

  listar(): Observable<ModalidadesMatriculaResponse[]> {
    return this.http.get<ModalidadesMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ModalidadesMatriculaResponse> {
    return this.http.get<ModalidadesMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ModalidadesMatriculaRequest): Observable<ModalidadesMatriculaResponse> {
    return this.http.post<ModalidadesMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ModalidadesMatriculaRequest): Observable<ModalidadesMatriculaResponse> {
    return this.http.put<ModalidadesMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
