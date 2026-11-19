import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface EstadoCuenta {
  idEstudiante: string;
  nombres: string;
  apellidos: string;
  dni: string;
  tieneDeudaPendiente: boolean;
}

@Component({
  selector: 'app-estado-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <header class="top">
        <h1>Estado Financiero</h1>
        <p class="hint">Consulta si un estudiante tiene deudas pendientes de pago.</p>
      </header>

      <div class="card">
        <label>ID del estudiante</label>
        <div class="row">
          <input type="text" [(ngModel)]="idEstudiante" placeholder="UUID del estudiante" />
          <button (click)="buscar()" [disabled]="loading() || !idEstudiante()">
            {{ loading() ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>
        @if (error()) { <p class="err">{{ error() }}</p> }
      </div>

      @if (result()) {
        <div class="result" [class.debt]="result()!.tieneDeudaPendiente">
          <p><b>Estudiante:</b> {{ result()!.nombres }} {{ result()!.apellidos }}</p>
          <p><b>DNI:</b> {{ result()!.dni }}</p>
          <p>
            <b>Estado:</b>
            @if (result()!.tieneDeudaPendiente) {
              <span class="badge badge-debt">Tiene deuda pendiente</span>
            } @else {
              <span class="badge badge-ok">Sin deudas pendientes</span>
            }
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .wrap { max-width: 640px; margin: 2rem auto; padding: 1rem; font-family: system-ui; }
    .top h1 { margin: 0 0 .25rem; color: #003366; }
    .hint { color: #666; margin: 0 0 1rem; }
    .card, .result { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.08); margin-bottom: 1rem; }
    .row { display: flex; gap: .5rem; margin-top: .5rem; }
    input { flex: 1; padding: .6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    button { padding: .6rem 1.2rem; border: 0; border-radius: 4px; cursor: pointer; font-weight: 600; color: #fff; background: #003366; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    .err { color: #c00; margin-top: .5rem; }
    .badge { padding: .25rem .6rem; border-radius: 12px; font-size: .85rem; font-weight: 600; }
    .badge-debt { background: #fdecea; color: #c00; }
    .badge-ok { background: #e8f5e9; color: #0a7a2f; }
  `]
})
export class EstadoCuentaComponent {
  private api = inject(ApiService);

  idEstudiante = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<EstadoCuenta | null>(null);

  buscar(): void {
    const id = this.idEstudiante();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    this.api.get<EstadoCuenta>(`/api/v1/estudiantes/${id}/estado-cuenta`).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        const message = err?.status === 404
          ? 'No existe un estudiante con ese ID.'
          : err?.error?.message || 'Error al consultar el estado de cuenta.';
        this.error.set(message);
        this.loading.set(false);
      },
    });
  }
}
