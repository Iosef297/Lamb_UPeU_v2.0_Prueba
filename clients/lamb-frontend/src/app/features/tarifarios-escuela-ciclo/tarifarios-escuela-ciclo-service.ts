import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TarifariosEscuelaCicloRequest, TarifariosEscuelaCicloResponse } from './tarifarios-escuela-ciclo.model';

@Injectable({ providedIn: 'root' })
export class TarifariosEscuelaCicloService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/catalogos-tarifas/tarifarios-escuela-ciclo`;

  listar(): Observable<TarifariosEscuelaCicloResponse[]> {
    return this.http.get<TarifariosEscuelaCicloResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<TarifariosEscuelaCicloResponse> {
    return this.http.get<TarifariosEscuelaCicloResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: TarifariosEscuelaCicloRequest): Observable<TarifariosEscuelaCicloResponse> {
    return this.http.post<TarifariosEscuelaCicloResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: TarifariosEscuelaCicloRequest): Observable<TarifariosEscuelaCicloResponse> {
    return this.http.put<TarifariosEscuelaCicloResponse>(`${this.baseUrl}/${id}`, request);
  }
}
