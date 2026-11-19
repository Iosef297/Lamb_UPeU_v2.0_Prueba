import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EleccionesCursoElectivoRequest, EleccionesCursoElectivoResponse } from './elecciones-curso-electivo.model';

@Injectable({ providedIn: 'root' })
export class EleccionesCursoElectivoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/cursos-carga-academica/elecciones-electivos`;

  listar(): Observable<EleccionesCursoElectivoResponse[]> {
    return this.http.get<EleccionesCursoElectivoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<EleccionesCursoElectivoResponse> {
    return this.http.get<EleccionesCursoElectivoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: EleccionesCursoElectivoRequest): Observable<EleccionesCursoElectivoResponse> {
    return this.http.post<EleccionesCursoElectivoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: EleccionesCursoElectivoRequest): Observable<EleccionesCursoElectivoResponse> {
    return this.http.put<EleccionesCursoElectivoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
