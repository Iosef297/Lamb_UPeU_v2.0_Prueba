import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IntentosCursoRequest, IntentosCursoResponse } from './intentos-curso.model';

@Injectable({ providedIn: 'root' })
export class IntentosCursoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cursos-carga-academica/intentos-curso`;

  listar(): Observable<IntentosCursoResponse[]> {
    return this.http.get<IntentosCursoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<IntentosCursoResponse> {
    return this.http.get<IntentosCursoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: IntentosCursoRequest): Observable<IntentosCursoResponse> {
    return this.http.post<IntentosCursoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: IntentosCursoRequest): Observable<IntentosCursoResponse> {
    return this.http.put<IntentosCursoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
