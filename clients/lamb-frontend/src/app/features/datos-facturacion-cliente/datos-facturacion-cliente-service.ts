import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DatosFacturacionClienteRequest, DatosFacturacionClienteResponse } from './datos-facturacion-cliente.model';

@Injectable({ providedIn: 'root' })
export class DatosFacturacionClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/comprobantes/datos-facturacion-cliente`;

  listar(): Observable<DatosFacturacionClienteResponse[]> {
    return this.http.get<DatosFacturacionClienteResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<DatosFacturacionClienteResponse> {
    return this.http.get<DatosFacturacionClienteResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: DatosFacturacionClienteRequest): Observable<DatosFacturacionClienteResponse> {
    return this.http.post<DatosFacturacionClienteResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: DatosFacturacionClienteRequest): Observable<DatosFacturacionClienteResponse> {
    return this.http.put<DatosFacturacionClienteResponse>(`${this.baseUrl}/${id}`, request);
  }
}
