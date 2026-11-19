import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovilidadesEstudiantilesRequest, MovilidadesEstudiantilesResponse } from './movilidades-estudiantiles.model';

@Injectable({ providedIn: 'root' })
export class MovilidadesEstudiantilesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/situacion-estudiante/movilidades`;

  listar(): Observable<MovilidadesEstudiantilesResponse[]> {
    return this.http.get<MovilidadesEstudiantilesResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<MovilidadesEstudiantilesResponse> {
    return this.http.get<MovilidadesEstudiantilesResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: MovilidadesEstudiantilesRequest): Observable<MovilidadesEstudiantilesResponse> {
    return this.http.post<MovilidadesEstudiantilesResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: MovilidadesEstudiantilesRequest): Observable<MovilidadesEstudiantilesResponse> {
    return this.http.put<MovilidadesEstudiantilesResponse>(`${this.baseUrl}/${id}`, request);
  }
}
