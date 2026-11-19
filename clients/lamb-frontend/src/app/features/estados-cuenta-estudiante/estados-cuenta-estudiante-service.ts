import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadosCuentaEstudianteRequest, EstadosCuentaEstudianteResponse } from './estados-cuenta-estudiante.model';

@Injectable({ providedIn: 'root' })
export class EstadosCuentaEstudianteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/control-cierre/estados-cuenta-estudiante`;

  listar(): Observable<EstadosCuentaEstudianteResponse[]> {
    return this.http.get<EstadosCuentaEstudianteResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<EstadosCuentaEstudianteResponse> {
    return this.http.get<EstadosCuentaEstudianteResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: EstadosCuentaEstudianteRequest): Observable<EstadosCuentaEstudianteResponse> {
    return this.http.post<EstadosCuentaEstudianteResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: EstadosCuentaEstudianteRequest): Observable<EstadosCuentaEstudianteResponse> {
    return this.http.put<EstadosCuentaEstudianteResponse>(`${this.baseUrl}/${id}`, request);
  }
}
