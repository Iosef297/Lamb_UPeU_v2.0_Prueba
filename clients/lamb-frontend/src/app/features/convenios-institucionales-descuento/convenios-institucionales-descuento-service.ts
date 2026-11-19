import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConveniosInstitucionalesDescuentoRequest, ConveniosInstitucionalesDescuentoResponse } from './convenios-institucionales-descuento.model';

@Injectable({ providedIn: 'root' })
export class ConveniosInstitucionalesDescuentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/descuentos-becas/convenios-institucionales-descuento`;

  listar(): Observable<ConveniosInstitucionalesDescuentoResponse[]> {
    return this.http.get<ConveniosInstitucionalesDescuentoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ConveniosInstitucionalesDescuentoResponse> {
    return this.http.get<ConveniosInstitucionalesDescuentoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ConveniosInstitucionalesDescuentoRequest): Observable<ConveniosInstitucionalesDescuentoResponse> {
    return this.http.post<ConveniosInstitucionalesDescuentoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ConveniosInstitucionalesDescuentoRequest): Observable<ConveniosInstitucionalesDescuentoResponse> {
    return this.http.put<ConveniosInstitucionalesDescuentoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
