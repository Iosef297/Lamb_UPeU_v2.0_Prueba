import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrucesHorarioAutorizadosRequest, CrucesHorarioAutorizadosResponse } from './cruces-horario-autorizados.model';

@Injectable({ providedIn: 'root' })
export class CrucesHorarioAutorizadosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cursos-carga-academica/cruces-horario`;

  listar(): Observable<CrucesHorarioAutorizadosResponse[]> {
    return this.http.get<CrucesHorarioAutorizadosResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CrucesHorarioAutorizadosResponse> {
    return this.http.get<CrucesHorarioAutorizadosResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CrucesHorarioAutorizadosRequest): Observable<CrucesHorarioAutorizadosResponse> {
    return this.http.post<CrucesHorarioAutorizadosResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CrucesHorarioAutorizadosRequest): Observable<CrucesHorarioAutorizadosResponse> {
    return this.http.put<CrucesHorarioAutorizadosResponse>(`${this.baseUrl}/${id}`, request);
  }
}
