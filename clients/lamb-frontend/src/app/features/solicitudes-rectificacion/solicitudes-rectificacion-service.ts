import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SolicitudesRectificacionRequest, SolicitudesRectificacionResponse } from './solicitudes-rectificacion.model';

@Injectable({ providedIn: 'root' })
export class SolicitudesRectificacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/rectificacion-retiro-reactivacion/rectificaciones`;

  listar(): Observable<SolicitudesRectificacionResponse[]> {
    return this.http.get<SolicitudesRectificacionResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<SolicitudesRectificacionResponse> {
    return this.http.get<SolicitudesRectificacionResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: SolicitudesRectificacionRequest): Observable<SolicitudesRectificacionResponse> {
    return this.http.post<SolicitudesRectificacionResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: SolicitudesRectificacionRequest): Observable<SolicitudesRectificacionResponse> {
    return this.http.put<SolicitudesRectificacionResponse>(`${this.baseUrl}/${id}`, request);
  }
}
