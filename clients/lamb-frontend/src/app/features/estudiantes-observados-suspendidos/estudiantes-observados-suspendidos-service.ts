import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstudiantesObservadosSuspendidosRequest, EstudiantesObservadosSuspendidosResponse } from './estudiantes-observados-suspendidos.model';

@Injectable({ providedIn: 'root' })
export class EstudiantesObservadosSuspendidosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/situacion-estudiante/observados-suspendidos`;

  listar(): Observable<EstudiantesObservadosSuspendidosResponse[]> {
    return this.http.get<EstudiantesObservadosSuspendidosResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<EstudiantesObservadosSuspendidosResponse> {
    return this.http.get<EstudiantesObservadosSuspendidosResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: EstudiantesObservadosSuspendidosRequest): Observable<EstudiantesObservadosSuspendidosResponse> {
    return this.http.post<EstudiantesObservadosSuspendidosResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: EstudiantesObservadosSuspendidosRequest): Observable<EstudiantesObservadosSuspendidosResponse> {
    return this.http.put<EstudiantesObservadosSuspendidosResponse>(`${this.baseUrl}/${id}`, request);
  }
}
