import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CambiosSituacionAcademicaRequest, CambiosSituacionAcademicaResponse } from './cambios-situacion-academica.model';

@Injectable({ providedIn: 'root' })
export class CambiosSituacionAcademicaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/situacion-estudiante/cambios-situacion`;

  listar(): Observable<CambiosSituacionAcademicaResponse[]> {
    return this.http.get<CambiosSituacionAcademicaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CambiosSituacionAcademicaResponse> {
    return this.http.get<CambiosSituacionAcademicaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CambiosSituacionAcademicaRequest): Observable<CambiosSituacionAcademicaResponse> {
    return this.http.post<CambiosSituacionAcademicaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CambiosSituacionAcademicaRequest): Observable<CambiosSituacionAcademicaResponse> {
    return this.http.put<CambiosSituacionAcademicaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
