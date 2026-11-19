import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DetallesCobroRequest, DetallesCobroResponse } from './detalles-cobro.model';

@Injectable({ providedIn: 'root' })
export class DetallesCobroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cobros/detalles-cobro`;

  listar(): Observable<DetallesCobroResponse[]> {
    return this.http.get<DetallesCobroResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<DetallesCobroResponse> {
    return this.http.get<DetallesCobroResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: DetallesCobroRequest): Observable<DetallesCobroResponse> {
    return this.http.post<DetallesCobroResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: DetallesCobroRequest): Observable<DetallesCobroResponse> {
    return this.http.put<DetallesCobroResponse>(`${this.baseUrl}/${id}`, request);
  }
}
