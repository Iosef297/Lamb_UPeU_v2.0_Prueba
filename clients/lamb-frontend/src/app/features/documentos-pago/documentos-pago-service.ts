import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentosPagoRequest, DocumentosPagoResponse } from './documentos-pago.model';

@Injectable({ providedIn: 'root' })
export class DocumentosPagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/comprobantes/documentos-pago`;

  listar(): Observable<DocumentosPagoResponse[]> {
    return this.http.get<DocumentosPagoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<DocumentosPagoResponse> {
    return this.http.get<DocumentosPagoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: DocumentosPagoRequest): Observable<DocumentosPagoResponse> {
    return this.http.post<DocumentosPagoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: DocumentosPagoRequest): Observable<DocumentosPagoResponse> {
    return this.http.put<DocumentosPagoResponse>(`${this.baseUrl}/${id}`, request);
  }
}
