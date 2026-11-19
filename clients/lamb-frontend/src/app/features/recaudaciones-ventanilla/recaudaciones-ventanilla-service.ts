import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecaudacionesVentanillaRequest, RecaudacionesVentanillaResponse } from './recaudaciones-ventanilla.model';

@Injectable({ providedIn: 'root' })
export class RecaudacionesVentanillaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/pagos/recaudaciones-ventanilla`;

  listar(): Observable<RecaudacionesVentanillaResponse[]> {
    return this.http.get<RecaudacionesVentanillaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<RecaudacionesVentanillaResponse> {
    return this.http.get<RecaudacionesVentanillaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: RecaudacionesVentanillaRequest): Observable<RecaudacionesVentanillaResponse> {
    return this.http.post<RecaudacionesVentanillaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: RecaudacionesVentanillaRequest): Observable<RecaudacionesVentanillaResponse> {
    return this.http.put<RecaudacionesVentanillaResponse>(`${this.baseUrl}/${id}`, request);
  }
}
