import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnulacionesMasivasImpagoRequest, AnulacionesMasivasImpagoResponse } from './anulaciones-masivas-impago.model';

@Injectable({ providedIn: 'root' })
export class AnulacionesMasivasImpagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/rectificacion-retiro-reactivacion/anulaciones-masivas`;

  listar(): Observable<AnulacionesMasivasImpagoResponse[]> {
    return this.http.get<AnulacionesMasivasImpagoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<AnulacionesMasivasImpagoResponse> {
    return this.http.get<AnulacionesMasivasImpagoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: AnulacionesMasivasImpagoRequest): Observable<AnulacionesMasivasImpagoResponse> {
    return this.http.post<AnulacionesMasivasImpagoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: AnulacionesMasivasImpagoRequest): Observable<AnulacionesMasivasImpagoResponse> {
    return this.http.put<AnulacionesMasivasImpagoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
