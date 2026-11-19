import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { SinGuion } from '../../core/sin-guion.pipe';

interface TrayectoriaDataResponse {
  id: number;
  idPersona: number;
  idPrograma: number;
  periodo: string;
  estado: string;
  fechaIngreso: string;
}

interface HistorialCursoResponse {
  idCurso: number;
  nombreCurso: string;
  estado: string;
}

interface TrayectoriaResponse {
  trayectoria: TrayectoriaDataResponse;
  historial: HistorialCursoResponse[];
}

const INTERVALO_POLLING_MS = 4000;

@Component({
  selector: 'app-mi-trayectoria',
  standalone: true,
  imports: [SinGuion],
  template: `
    <div class="wrap">
      <h2>Mi trayectoria</h2>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      @if (pendiente()) {
        <p class="info">Aún no tienes trayectoria registrada. Se actualizará automáticamente cuando tu admisión se procese.</p>
      }

      @if (trayectoria(); as t) {
        <section class="card">
          <p><strong>Estado:</strong> {{ t.trayectoria.estado | sinGuion }}</p>
          <p><strong>Programa:</strong> {{ t.trayectoria.idPrograma }}</p>
          <p><strong>Periodo:</strong> {{ t.trayectoria.periodo }}</p>
          <p><strong>Fecha de ingreso:</strong> {{ t.trayectoria.fechaIngreso }}</p>

          <h3>Historial de cursos</h3>
          <table>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (curso of t.historial; track curso.idCurso) {
                <tr>
                  <td>{{ curso.nombreCurso }}</td>
                  <td>{{ curso.estado | sinGuion }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="2">Sin cursos registrados aún.</td>
                </tr>
              }
            </tbody>
          </table>
        </section>
      }
    </div>
  `,
  styles: [`
    .wrap { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
    h2 { color: #0f1e3f; margin: 0 0 1rem; }
    .error { color: #c00; }
    .info { color: #666; }
    .card { background: #fff; border: 1px solid #e6e8ef; border-radius: 12px; padding: 1.25rem; }
    .card p { margin: .25rem 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: .5rem; border-bottom: 1px solid #eee; }
  `]
})
export class MiTrayectoriaComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private intervaloId: ReturnType<typeof setInterval> | null = null;

  protected trayectoria = signal<TrayectoriaResponse | null>(null);
  protected pendiente = signal(false);
  protected error = signal<string | null>(null);

  ngOnInit(): void {
    this.consultar();
    this.intervaloId = setInterval(() => this.consultar(), INTERVALO_POLLING_MS);
  }

  ngOnDestroy(): void {
    if (this.intervaloId !== null) {
      clearInterval(this.intervaloId);
    }
  }

  private consultar(): void {
    this.api.get<TrayectoriaResponse>('/api/v1/trayectorias/me').subscribe({
      next: (data) => {
        this.trayectoria.set(data);
        this.pendiente.set(false);
        this.error.set(null);
        if (this.intervaloId !== null) {
          clearInterval(this.intervaloId);
          this.intervaloId = null;
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.pendiente.set(true);
          this.error.set(null);
        } else {
          this.error.set('No se pudo consultar la trayectoria.');
        }
      },
    });
  }
}
