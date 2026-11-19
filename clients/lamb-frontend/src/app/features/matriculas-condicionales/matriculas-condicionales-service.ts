import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatriculasCondicionalesRequest, MatriculasCondicionalesResponse } from './matriculas-condicionales.model';

@Injectable({ providedIn: 'root' })
export class MatriculasCondicionalesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/matriculas/condicionales`;

  listar(): Observable<MatriculasCondicionalesResponse[]> {
    return this.http.get<MatriculasCondicionalesResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<MatriculasCondicionalesResponse> {
    return this.http.get<MatriculasCondicionalesResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: MatriculasCondicionalesRequest): Observable<MatriculasCondicionalesResponse> {
    return this.http.post<MatriculasCondicionalesResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: MatriculasCondicionalesRequest): Observable<MatriculasCondicionalesResponse> {
    return this.http.put<MatriculasCondicionalesResponse>(`${this.baseUrl}/${id}`, request);
  }
}
