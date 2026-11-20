import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

interface EstadoCuenta {
  idEstudiante: string;
  nombres: string;
  apellidos: string;
  dni: string;
  tieneDeudaPendiente: boolean;
}

interface ConceptoPago {
  id: number;
  nombre: string;
  monto?: number;
}

interface MetodoPago {
  id: number;
  nombre: string;
}

// lamb-finanzas-ms expone MetodoPago como enum fijo (sin catalogo CRUD todavia).
const METODOS_PAGO: MetodoPago[] = [
  { id: 1, nombre: 'TARJETA' },
  { id: 2, nombre: 'YAPE' },
  { id: 3, nombre: 'PLIN' },
  { id: 4, nombre: 'TRANSFERENCIA' },
  { id: 5, nombre: 'EFECTIVO' },
];

interface PagoConceptoResponse {
  id: number;
  monto: number;
  fechaPago: string;
}

@Component({
  selector: 'app-realizar-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="wrap">
      <header class="top">
        <h1>Realizar pago</h1>
        <p class="hint">
          Ingresa tu código de estudiante para registrar un pago. Puedes revisar tu
          <a routerLink="/estado-cuenta">estado de cuenta</a> antes de continuar.
        </p>
      </header>

      <div class="card">
        <label>Código de estudiante</label>
        <div class="row">
          <input type="text" [(ngModel)]="codigoEstudiante" placeholder="Código o ID del estudiante" />
          <button (click)="buscarEstudiante()" [disabled]="buscando() || !codigoEstudiante()">
            {{ buscando() ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>
        @if (errorBusqueda()) { <p class="err">{{ errorBusqueda() }}</p> }
      </div>

      @if (estudiante()) {
        <div class="card">
          <p><b>Estudiante:</b> {{ estudiante()!.nombres }} {{ estudiante()!.apellidos }}</p>

          <label>Concepto de pago</label>
          <select [(ngModel)]="conceptoPagoId" (ngModelChange)="onConceptoChange()">
            <option [ngValue]="null">Selecciona un concepto</option>
            @for (c of conceptos(); track c.id) {
              <option [ngValue]="c.id">{{ c.nombre }}</option>
            }
          </select>

          <label>Método de pago</label>
          <select [(ngModel)]="metodoPagoId">
            <option [ngValue]="null">Selecciona un método</option>
            @for (m of metodos(); track m.id) {
              <option [ngValue]="m.id">{{ m.nombre }}</option>
            }
          </select>

          <label>Monto (S/)</label>
          <input type="number" min="0.01" step="0.01" [(ngModel)]="monto" />

          <label>Observación (opcional)</label>
          <textarea [(ngModel)]="observacion" rows="2"></textarea>

          <button class="pay" (click)="pagar()" [disabled]="pagando() || !puedePagar()">
            {{ pagando() ? 'Procesando...' : 'Pagar' }}
          </button>

          @if (errorPago()) { <p class="err">{{ errorPago() }}</p> }
        </div>
      }

      @if (pagoRealizado()) {
        <div class="card ok">
          <p><b>Pago registrado correctamente.</b></p>
          <p>N° de operación: {{ pagoRealizado()!.id }}</p>
          <p>Monto: S/ {{ pagoRealizado()!.monto }}</p>
          <p>Fecha: {{ pagoRealizado()!.fechaPago }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .wrap { max-width: 640px; margin: 2rem auto; padding: 1rem; font-family: system-ui; }
    .top h1 { margin: 0 0 .25rem; color: #003366; }
    .hint { color: #666; margin: 0 0 1rem; }
    .card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.08); margin-bottom: 1rem; }
    .card.ok { border: 1px solid #0a7a2f; }
    label { display: block; margin-top: .75rem; font-weight: 600; font-size: .9rem; color: #333; }
    .row { display: flex; gap: .5rem; margin-top: .5rem; }
    input, select, textarea { width: 100%; padding: .6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; margin-top: .25rem; box-sizing: border-box; }
    .row input { flex: 1; margin-top: 0; }
    button { padding: .6rem 1.2rem; border: 0; border-radius: 4px; cursor: pointer; font-weight: 600; color: #fff; background: #003366; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    button.pay { margin-top: 1rem; background: #0a7a2f; }
    .err { color: #c00; margin-top: .5rem; }
  `]
})
export class RealizarPagoComponent {
  private api = inject(ApiService);

  codigoEstudiante = signal('');
  buscando = signal(false);
  errorBusqueda = signal<string | null>(null);
  estudiante = signal<EstadoCuenta | null>(null);

  conceptos = signal<ConceptoPago[]>([]);
  metodos = signal<MetodoPago[]>([]);
  conceptoPagoId: number | null = null;
  metodoPagoId: number | null = null;
  monto: number | null = null;
  observacion = '';

  pagando = signal(false);
  errorPago = signal<string | null>(null);
  pagoRealizado = signal<PagoConceptoResponse | null>(null);

  buscarEstudiante(): void {
    const codigo = this.codigoEstudiante();
    if (!codigo) return;
    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.estudiante.set(null);
    this.pagoRealizado.set(null);
    this.api.get<EstadoCuenta>(`/api/v1/estudiantes/${codigo}/estado-cuenta`).subscribe({
      next: (res) => {
        this.estudiante.set(res);
        this.buscando.set(false);
        this.cargarCatalogos();
      },
      error: (err) => {
        const message = err?.status === 404
          ? 'No existe un estudiante con ese código o ID.'
          : err?.error?.message || 'Error al buscar el estudiante.';
        this.errorBusqueda.set(message);
        this.buscando.set(false);
      },
    });
  }

  private cargarCatalogos(): void {
    this.api.list<ConceptoPago>('/api/v1/catalogos-tarifas/conceptos-pago').subscribe((r) => this.conceptos.set(r));
    this.metodos.set(METODOS_PAGO);
  }

  onConceptoChange(): void {
    const concepto = this.conceptos().find((c) => c.id === this.conceptoPagoId);
    if (concepto?.monto != null) {
      this.monto = concepto.monto;
    }
  }

  puedePagar(): boolean {
    return !!this.estudiante() && !!this.conceptoPagoId && !!this.metodoPagoId && !!this.monto && this.monto > 0;
  }

  pagar(): void {
    const estudiante = this.estudiante();
    if (!estudiante || !this.puedePagar()) return;
    this.pagando.set(true);
    this.errorPago.set(null);
    this.pagoRealizado.set(null);
    this.api.post<PagoConceptoResponse>('/api/v1/pagos-concepto', {
      idEstudiante: estudiante.idEstudiante,
      conceptoPagoId: this.conceptoPagoId,
      metodoPagoId: this.metodoPagoId,
      monto: this.monto,
      observacion: this.observacion || null,
    }).subscribe({
      next: (res) => {
        this.pagoRealizado.set(res);
        this.pagando.set(false);
        this.conceptoPagoId = null;
        this.metodoPagoId = null;
        this.monto = null;
        this.observacion = '';
      },
      error: (err) => {
        this.errorPago.set(err?.error?.message || 'Error al registrar el pago.');
        this.pagando.set(false);
      },
    });
  }
}
