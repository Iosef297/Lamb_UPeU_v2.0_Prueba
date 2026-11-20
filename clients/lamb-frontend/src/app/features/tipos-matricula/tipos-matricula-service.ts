import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TiposMatriculaRequest, TiposMatriculaResponse } from './tipos-matricula.model';

@Injectable({ providedIn: 'root' })
export class TiposMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/calendario-periodos/tipos`;

  listar(): Observable<TiposMatriculaResponse[]> {
    return this.http.get<TiposMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<TiposMatriculaResponse> {
    return this.http.get<TiposMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: TiposMatriculaRequest): Observable<TiposMatriculaResponse> {
    return this.http.post<TiposMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: TiposMatriculaRequest): Observable<TiposMatriculaResponse> {
    return this.http.put<TiposMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
