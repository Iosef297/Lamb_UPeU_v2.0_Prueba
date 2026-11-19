import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RetirosOficioRequest, RetirosOficioResponse } from './retiros-oficio.model';

@Injectable({ providedIn: 'root' })
export class RetirosOficioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/rectificacion-retiro-reactivacion/retiros-oficio`;

  listar(): Observable<RetirosOficioResponse[]> {
    return this.http.get<RetirosOficioResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<RetirosOficioResponse> {
    return this.http.get<RetirosOficioResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: RetirosOficioRequest): Observable<RetirosOficioResponse> {
    return this.http.post<RetirosOficioResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: RetirosOficioRequest): Observable<RetirosOficioResponse> {
    return this.http.put<RetirosOficioResponse>(`${this.baseUrl}/${id}`, request);
  }
}
