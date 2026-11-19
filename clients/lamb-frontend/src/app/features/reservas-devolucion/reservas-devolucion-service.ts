import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservasDevolucionRequest, ReservasDevolucionResponse } from './reservas-devolucion.model';

@Injectable({ providedIn: 'root' })
export class ReservasDevolucionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/saldo-estudiante/reservas-devolucion`;

  listar(): Observable<ReservasDevolucionResponse[]> {
    return this.http.get<ReservasDevolucionResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ReservasDevolucionResponse> {
    return this.http.get<ReservasDevolucionResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ReservasDevolucionRequest): Observable<ReservasDevolucionResponse> {
    return this.http.post<ReservasDevolucionResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ReservasDevolucionRequest): Observable<ReservasDevolucionResponse> {
    return this.http.put<ReservasDevolucionResponse>(`${this.baseUrl}/${id}`, request);
  }
}
