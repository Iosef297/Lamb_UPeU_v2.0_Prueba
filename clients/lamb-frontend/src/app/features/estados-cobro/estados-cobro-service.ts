import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadosCobroRequest, EstadosCobroResponse } from './estados-cobro.model';

@Injectable({ providedIn: 'root' })
export class EstadosCobroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cobros/estados-cobro`;

  listar(): Observable<EstadosCobroResponse[]> {
    return this.http.get<EstadosCobroResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<EstadosCobroResponse> {
    return this.http.get<EstadosCobroResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: EstadosCobroRequest): Observable<EstadosCobroResponse> {
    return this.http.post<EstadosCobroResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: EstadosCobroRequest): Observable<EstadosCobroResponse> {
    return this.http.put<EstadosCobroResponse>(`${this.baseUrl}/${id}`, request);
  }
}
