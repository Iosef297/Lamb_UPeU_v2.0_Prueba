import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservasVacanteRequest, ReservasVacanteResponse } from './reservas-vacante.model';

@Injectable({ providedIn: 'root' })
export class ReservasVacanteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/oferta-cupos/reservas-vacante`;

  listar(): Observable<ReservasVacanteResponse[]> {
    return this.http.get<ReservasVacanteResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ReservasVacanteResponse> {
    return this.http.get<ReservasVacanteResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ReservasVacanteRequest): Observable<ReservasVacanteResponse> {
    return this.http.post<ReservasVacanteResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ReservasVacanteRequest): Observable<ReservasVacanteResponse> {
    return this.http.put<ReservasVacanteResponse>(`${this.baseUrl}/${id}`, request);
  }
}
