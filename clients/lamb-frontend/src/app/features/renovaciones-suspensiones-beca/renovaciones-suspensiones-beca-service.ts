import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RenovacionesSuspensionesBecaRequest, RenovacionesSuspensionesBecaResponse } from './renovaciones-suspensiones-beca.model';

@Injectable({ providedIn: 'root' })
export class RenovacionesSuspensionesBecaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/descuentos-becas/renovaciones-suspensiones-beca`;

  listar(): Observable<RenovacionesSuspensionesBecaResponse[]> {
    return this.http.get<RenovacionesSuspensionesBecaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<RenovacionesSuspensionesBecaResponse> {
    return this.http.get<RenovacionesSuspensionesBecaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: RenovacionesSuspensionesBecaRequest): Observable<RenovacionesSuspensionesBecaResponse> {
    return this.http.post<RenovacionesSuspensionesBecaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: RenovacionesSuspensionesBecaRequest): Observable<RenovacionesSuspensionesBecaResponse> {
    return this.http.put<RenovacionesSuspensionesBecaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
