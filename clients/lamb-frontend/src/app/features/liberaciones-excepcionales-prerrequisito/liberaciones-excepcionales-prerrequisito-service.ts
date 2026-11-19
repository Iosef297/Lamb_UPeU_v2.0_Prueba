import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LiberacionesExcepcionalesPrerrequisitoRequest, LiberacionesExcepcionalesPrerrequisitoResponse } from './liberaciones-excepcionales-prerrequisito.model';

@Injectable({ providedIn: 'root' })
export class LiberacionesExcepcionalesPrerrequisitoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cursos-carga-academica/liberaciones-prerrequisito`;

  listar(): Observable<LiberacionesExcepcionalesPrerrequisitoResponse[]> {
    return this.http.get<LiberacionesExcepcionalesPrerrequisitoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<LiberacionesExcepcionalesPrerrequisitoResponse> {
    return this.http.get<LiberacionesExcepcionalesPrerrequisitoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: LiberacionesExcepcionalesPrerrequisitoRequest): Observable<LiberacionesExcepcionalesPrerrequisitoResponse> {
    return this.http.post<LiberacionesExcepcionalesPrerrequisitoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: LiberacionesExcepcionalesPrerrequisitoRequest): Observable<LiberacionesExcepcionalesPrerrequisitoResponse> {
    return this.http.put<LiberacionesExcepcionalesPrerrequisitoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
