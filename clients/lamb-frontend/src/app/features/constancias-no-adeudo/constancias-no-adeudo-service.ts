import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConstanciasNoAdeudoRequest, ConstanciasNoAdeudoResponse } from './constancias-no-adeudo.model';

@Injectable({ providedIn: 'root' })
export class ConstanciasNoAdeudoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/control-cierre/constancias-no-adeudo`;

  listar(): Observable<ConstanciasNoAdeudoResponse[]> {
    return this.http.get<ConstanciasNoAdeudoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ConstanciasNoAdeudoResponse> {
    return this.http.get<ConstanciasNoAdeudoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ConstanciasNoAdeudoRequest): Observable<ConstanciasNoAdeudoResponse> {
    return this.http.post<ConstanciasNoAdeudoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ConstanciasNoAdeudoRequest): Observable<ConstanciasNoAdeudoResponse> {
    return this.http.put<ConstanciasNoAdeudoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
