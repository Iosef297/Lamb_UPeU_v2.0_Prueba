import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SobrecargasCreditosAutorizadasRequest, SobrecargasCreditosAutorizadasResponse } from './sobrecargas-creditos-autorizadas.model';

@Injectable({ providedIn: 'root' })
export class SobrecargasCreditosAutorizadasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cursos-carga-academica/sobrecargas-creditos`;

  listar(): Observable<SobrecargasCreditosAutorizadasResponse[]> {
    return this.http.get<SobrecargasCreditosAutorizadasResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<SobrecargasCreditosAutorizadasResponse> {
    return this.http.get<SobrecargasCreditosAutorizadasResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: SobrecargasCreditosAutorizadasRequest): Observable<SobrecargasCreditosAutorizadasResponse> {
    return this.http.post<SobrecargasCreditosAutorizadasResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: SobrecargasCreditosAutorizadasRequest): Observable<SobrecargasCreditosAutorizadasResponse> {
    return this.http.put<SobrecargasCreditosAutorizadasResponse>(`${this.baseUrl}/${id}`, request);
  }
}
