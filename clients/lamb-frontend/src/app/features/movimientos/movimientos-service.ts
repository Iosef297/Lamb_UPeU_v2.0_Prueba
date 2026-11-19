import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovimientosRequest, MovimientosResponse } from './movimientos.model';

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/saldo-estudiante/movimientos`;

  listar(): Observable<MovimientosResponse[]> {
    return this.http.get<MovimientosResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<MovimientosResponse> {
    return this.http.get<MovimientosResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: MovimientosRequest): Observable<MovimientosResponse> {
    return this.http.post<MovimientosResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: MovimientosRequest): Observable<MovimientosResponse> {
    return this.http.put<MovimientosResponse>(`${this.baseUrl}/${id}`, request);
  }
}
