import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VouchersRequest, VouchersResponse } from './vouchers.model';

@Injectable({ providedIn: 'root' })
export class VouchersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/pagos/vouchers`;

  listar(): Observable<VouchersResponse[]> {
    return this.http.get<VouchersResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<VouchersResponse> {
    return this.http.get<VouchersResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: VouchersRequest): Observable<VouchersResponse> {
    return this.http.post<VouchersResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: VouchersRequest): Observable<VouchersResponse> {
    return this.http.put<VouchersResponse>(`${this.baseUrl}/${id}`, request);
  }
}
