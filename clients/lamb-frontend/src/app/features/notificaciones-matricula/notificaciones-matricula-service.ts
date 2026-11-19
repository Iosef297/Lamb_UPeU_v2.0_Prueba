import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificacionesMatriculaRequest, NotificacionesMatriculaResponse } from './notificaciones-matricula.model';

@Injectable({ providedIn: 'root' })
export class NotificacionesMatriculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/matriculas/notificaciones`;

  listar(): Observable<NotificacionesMatriculaResponse[]> {
    return this.http.get<NotificacionesMatriculaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<NotificacionesMatriculaResponse> {
    return this.http.get<NotificacionesMatriculaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: NotificacionesMatriculaRequest): Observable<NotificacionesMatriculaResponse> {
    return this.http.post<NotificacionesMatriculaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: NotificacionesMatriculaRequest): Observable<NotificacionesMatriculaResponse> {
    return this.http.put<NotificacionesMatriculaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
