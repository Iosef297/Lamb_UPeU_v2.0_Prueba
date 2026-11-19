import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SaldosPeriodoRequest, SaldosPeriodoResponse } from './saldos-periodo.model';

@Injectable({ providedIn: 'root' })
export class SaldosPeriodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/saldo-estudiante/saldos-periodo`;

  listar(): Observable<SaldosPeriodoResponse[]> {
    return this.http.get<SaldosPeriodoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<SaldosPeriodoResponse> {
    return this.http.get<SaldosPeriodoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: SaldosPeriodoRequest): Observable<SaldosPeriodoResponse> {
    return this.http.post<SaldosPeriodoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: SaldosPeriodoRequest): Observable<SaldosPeriodoResponse> {
    return this.http.put<SaldosPeriodoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
