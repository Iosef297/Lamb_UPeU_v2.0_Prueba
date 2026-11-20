import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  // Algunos microservicios (ej. ingresos-pagos-ms) paginan sus listados y devuelven
  // { content: [...], page, size, ... } en vez de un array plano; se desenvuelve aqui
  // para que todo consumidor de list() reciba siempre T[].
  list<T>(path: string): Observable<T[]> {
    return this.http.get<any>(`${this.base}${path}`).pipe(
      map(r => Array.isArray(r) ? r : Array.isArray(r?.content) ? r.content : r)
    );
  }
  get<T>(path: string): Observable<T> { return this.http.get<T>(`${this.base}${path}`); }
  post<T>(path: string, body: unknown): Observable<T> { return this.http.post<T>(`${this.base}${path}`, body); }
  put<T>(path: string, body: unknown): Observable<T> { return this.http.put<T>(`${this.base}${path}`, body); }
  delete<T>(path: string): Observable<T> { return this.http.delete<T>(`${this.base}${path}`); }
  action<T>(path: string, body: unknown = {}): Observable<T> { return this.http.post<T>(`${this.base}${path}`, body); }
}
