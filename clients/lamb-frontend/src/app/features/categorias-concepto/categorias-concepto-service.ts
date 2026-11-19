import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriasConceptoRequest, CategoriasConceptoResponse } from './categorias-concepto.model';

@Injectable({ providedIn: 'root' })
export class CategoriasConceptoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/catalogos-tarifas/categorias-concepto`;

  listar(): Observable<CategoriasConceptoResponse[]> {
    return this.http.get<CategoriasConceptoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<CategoriasConceptoResponse> {
    return this.http.get<CategoriasConceptoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: CategoriasConceptoRequest): Observable<CategoriasConceptoResponse> {
    return this.http.post<CategoriasConceptoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CategoriasConceptoRequest): Observable<CategoriasConceptoResponse> {
    return this.http.put<CategoriasConceptoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
