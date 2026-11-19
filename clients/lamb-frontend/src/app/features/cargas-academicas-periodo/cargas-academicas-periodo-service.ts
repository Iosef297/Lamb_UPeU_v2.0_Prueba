import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CargasAcademicasPeriodoRequest, CargasAcademicasPeriodoResponse } from './cargas-academicas-periodo.model';

@Injectable({ providedIn: 'root' })
export class CargasAcademicasPeriodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cursos-carga-academica/cargas-periodo`;

  listar(): Observable<CargasAcademicasPeriodoResponse[]> {
    return this.http.get<CargasAcademicasPeriodoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CargasAcademicasPeriodoResponse> {
    return this.http.get<CargasAcademicasPeriodoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CargasAcademicasPeriodoRequest): Observable<CargasAcademicasPeriodoResponse> {
    return this.http.post<CargasAcademicasPeriodoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CargasAcademicasPeriodoRequest): Observable<CargasAcademicasPeriodoResponse> {
    return this.http.put<CargasAcademicasPeriodoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
