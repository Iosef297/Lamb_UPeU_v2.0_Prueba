import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SituacionesAcademicasEstudianteRequest, SituacionesAcademicasEstudianteResponse } from './situaciones-academicas-estudiante.model';

@Injectable({ providedIn: 'root' })
export class SituacionesAcademicasEstudianteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/situacion-estudiante/situaciones-academicas`;

  listar(): Observable<SituacionesAcademicasEstudianteResponse[]> {
    return this.http.get<SituacionesAcademicasEstudianteResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<SituacionesAcademicasEstudianteResponse> {
    return this.http.get<SituacionesAcademicasEstudianteResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: SituacionesAcademicasEstudianteRequest): Observable<SituacionesAcademicasEstudianteResponse> {
    return this.http.post<SituacionesAcademicasEstudianteResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: SituacionesAcademicasEstudianteRequest): Observable<SituacionesAcademicasEstudianteResponse> {
    return this.http.put<SituacionesAcademicasEstudianteResponse>(`${this.baseUrl}/${id}`, request);
  }
}
