import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListasEsperaSeccionRequest, ListasEsperaSeccionResponse } from './listas-espera-seccion.model';

@Injectable({ providedIn: 'root' })
export class ListasEsperaSeccionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/oferta-cupos/listas-espera`;

  listar(): Observable<ListasEsperaSeccionResponse[]> {
    return this.http.get<ListasEsperaSeccionResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ListasEsperaSeccionResponse> {
    return this.http.get<ListasEsperaSeccionResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ListasEsperaSeccionRequest): Observable<ListasEsperaSeccionResponse> {
    return this.http.post<ListasEsperaSeccionResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ListasEsperaSeccionRequest): Observable<ListasEsperaSeccionResponse> {
    return this.http.put<ListasEsperaSeccionResponse>(`${this.baseUrl}/${id}`, request);
  }
}
