import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DescuentosAplicadosRequest, DescuentosAplicadosResponse } from './descuentos-aplicados.model';

@Injectable({ providedIn: 'root' })
export class DescuentosAplicadosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/descuentos-becas/descuentos-aplicados`;

  listar(): Observable<DescuentosAplicadosResponse[]> {
    return this.http.get<DescuentosAplicadosResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<DescuentosAplicadosResponse> {
    return this.http.get<DescuentosAplicadosResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: DescuentosAplicadosRequest): Observable<DescuentosAplicadosResponse> {
    return this.http.post<DescuentosAplicadosResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: DescuentosAplicadosRequest): Observable<DescuentosAplicadosResponse> {
    return this.http.put<DescuentosAplicadosResponse>(`${this.baseUrl}/${id}`, request);
  }
}
