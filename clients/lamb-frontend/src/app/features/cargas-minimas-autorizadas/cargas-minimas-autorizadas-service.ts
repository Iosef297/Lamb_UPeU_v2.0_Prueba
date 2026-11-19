import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CargasMinimasAutorizadasRequest, CargasMinimasAutorizadasResponse } from './cargas-minimas-autorizadas.model';

@Injectable({ providedIn: 'root' })
export class CargasMinimasAutorizadasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cursos-carga-academica/cargas-minimas`;

  listar(): Observable<CargasMinimasAutorizadasResponse[]> {
    return this.http.get<CargasMinimasAutorizadasResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CargasMinimasAutorizadasResponse> {
    return this.http.get<CargasMinimasAutorizadasResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CargasMinimasAutorizadasRequest): Observable<CargasMinimasAutorizadasResponse> {
    return this.http.post<CargasMinimasAutorizadasResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CargasMinimasAutorizadasRequest): Observable<CargasMinimasAutorizadasResponse> {
    return this.http.put<CargasMinimasAutorizadasResponse>(`${this.baseUrl}/${id}`, request);
  }
}
