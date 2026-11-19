import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CronogramasVencimientoRequest, CronogramasVencimientoResponse } from './cronogramas-vencimiento.model';

@Injectable({ providedIn: 'root' })
export class CronogramasVencimientoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/calendario-planes/cronogramas-vencimiento`;

  listar(): Observable<CronogramasVencimientoResponse[]> {
    return this.http.get<CronogramasVencimientoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CronogramasVencimientoResponse> {
    return this.http.get<CronogramasVencimientoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CronogramasVencimientoRequest): Observable<CronogramasVencimientoResponse> {
    return this.http.post<CronogramasVencimientoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CronogramasVencimientoRequest): Observable<CronogramasVencimientoResponse> {
    return this.http.put<CronogramasVencimientoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
