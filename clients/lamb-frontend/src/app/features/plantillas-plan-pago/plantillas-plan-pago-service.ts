import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlantillasPlanPagoRequest, PlantillasPlanPagoResponse } from './plantillas-plan-pago.model';

@Injectable({ providedIn: 'root' })
export class PlantillasPlanPagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/calendario-planes/plantillas-plan-pago`;

  listar(): Observable<PlantillasPlanPagoResponse[]> {
    return this.http.get<PlantillasPlanPagoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<PlantillasPlanPagoResponse> {
    return this.http.get<PlantillasPlanPagoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: PlantillasPlanPagoRequest): Observable<PlantillasPlanPagoResponse> {
    return this.http.post<PlantillasPlanPagoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: PlantillasPlanPagoRequest): Observable<PlantillasPlanPagoResponse> {
    return this.http.put<PlantillasPlanPagoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
