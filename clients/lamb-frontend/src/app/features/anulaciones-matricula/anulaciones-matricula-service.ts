import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnulacionesMatriculaRequest, AnulacionesMatriculaResponse } from './anulaciones-matricula.model';

@Injectable({ providedIn: 'root' })
export class AnulacionesMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/matriculas/anulaciones`;

  listar(): Observable<AnulacionesMatriculaResponse[]> {
    return this.http.get<AnulacionesMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<AnulacionesMatriculaResponse> {
    return this.http.get<AnulacionesMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: AnulacionesMatriculaRequest): Observable<AnulacionesMatriculaResponse> {
    return this.http.post<AnulacionesMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: AnulacionesMatriculaRequest): Observable<AnulacionesMatriculaResponse> {
    return this.http.put<AnulacionesMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
