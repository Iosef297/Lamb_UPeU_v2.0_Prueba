import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AmpliacionesCupoRequest, AmpliacionesCupoResponse } from './ampliaciones-cupo.model';

@Injectable({ providedIn: 'root' })
export class AmpliacionesCupoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/oferta-cupos/ampliaciones-cupo`;

  listar(): Observable<AmpliacionesCupoResponse[]> {
    return this.http.get<AmpliacionesCupoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<AmpliacionesCupoResponse> {
    return this.http.get<AmpliacionesCupoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: AmpliacionesCupoRequest): Observable<AmpliacionesCupoResponse> {
    return this.http.post<AmpliacionesCupoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: AmpliacionesCupoRequest): Observable<AmpliacionesCupoResponse> {
    return this.http.put<AmpliacionesCupoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
