import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TiposDescuentoRequest, TiposDescuentoResponse } from './tipos-descuento.model';

@Injectable({ providedIn: 'root' })
export class TiposDescuentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/descuentos-becas/tipos-descuento`;

  listar(): Observable<TiposDescuentoResponse[]> {
    return this.http.get<TiposDescuentoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<TiposDescuentoResponse> {
    return this.http.get<TiposDescuentoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: TiposDescuentoRequest): Observable<TiposDescuentoResponse> {
    return this.http.post<TiposDescuentoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: TiposDescuentoRequest): Observable<TiposDescuentoResponse> {
    return this.http.put<TiposDescuentoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
