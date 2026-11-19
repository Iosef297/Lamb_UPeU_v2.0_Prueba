import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AjustesManualesRequest, AjustesManualesResponse } from './ajustes-manuales.model';

@Injectable({ providedIn: 'root' })
export class AjustesManualesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/saldo-estudiante/ajustes-manuales`;

  listar(): Observable<AjustesManualesResponse[]> {
    return this.http.get<AjustesManualesResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<AjustesManualesResponse> {
    return this.http.get<AjustesManualesResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: AjustesManualesRequest): Observable<AjustesManualesResponse> {
    return this.http.post<AjustesManualesResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: AjustesManualesRequest): Observable<AjustesManualesResponse> {
    return this.http.put<AjustesManualesResponse>(`${this.baseUrl}/${id}`, request);
  }
}
