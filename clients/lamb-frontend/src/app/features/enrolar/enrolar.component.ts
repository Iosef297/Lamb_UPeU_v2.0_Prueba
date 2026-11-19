import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface SeccionCurso {
  id: number;
  activo: boolean;
  nombreSeccion: string;
  curso?: { nombre: string };
  periodoAcademico?: { nombre: string };
  docente?: { nombres: string; apellidos: string };
}

const PAGO_INFO: Record<string, string> = {
  TARJETA: 'Pago con tarjeta: se validará el cargo antes de confirmar la matrícula.',
  TRANSFERENCIA: 'Transferencia bancaria: adjuntar N° de operación en ventanilla antes de 48h.',
  EFECTIVO: 'Pago en efectivo: acercarse a caja para completar el pago y recoger el comprobante.',
  YAPE: 'Pago por Yape: enviar captura del N° de operación a tesorería.',
  PLIN: 'Pago por Plin: enviar captura del N° de operación a tesorería.',
};

@Component({
  selector: 'app-enrolar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <h1>Matricularse</h1>

      <div class="card">
        <label>Periodo académico</label>
        <input type="text" [(ngModel)]="periodoAcademico" placeholder="Ej: 2026-I" />

        <label>Método de pago</label>
        <select [(ngModel)]="metodoPago" (change)="onMetodoPagoChange()">
          <option value="">Seleccione...</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
        </select>
        @if (pagoInfo()) { <p class="info">{{ pagoInfo() }}</p> }

        <h3>Secciones a matricular</h3>
        @for (d of detalles(); track $index; let i = $index) {
          <div class="row">
            <select [(ngModel)]="d.idSeccionCurso">
              <option value="">Seleccione sección...</option>
              @for (s of secciones(); track s.id) {
                <option [value]="s.id">
                  {{ s.curso?.nombre }} - {{ s.nombreSeccion }} ({{ s.periodoAcademico?.nombre }})
                </option>
              }
            </select>
            <button type="button" class="remove" (click)="removeDetalle(i)" [disabled]="detalles().length === 1">Quitar</button>
          </div>
        }
        <button type="button" class="add" (click)="addDetalle()">+ Agregar sección</button>

        @if (error()) { <p class="err">{{ error() }}</p> }
        @if (success()) { <p class="ok">Matrícula registrada correctamente.</p> }

        <button class="submit" (click)="submit()" [disabled]="saving()">
          {{ saving() ? 'Enviando...' : 'Matricularme' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .wrap { max-width: 640px; margin: 2rem auto; padding: 1rem; font-family: system-ui; }
    h1 { color: #003366; }
    .card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    label { display: block; margin-top: 1rem; font-weight: 600; }
    input, select { width: 100%; padding: .6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; margin-top: .25rem; }
    .info { color: #555; font-size: .9rem; margin-top: .4rem; }
    .row { display: flex; gap: .5rem; margin-top: .5rem; align-items: center; }
    .row select { flex: 1; margin-top: 0; }
    .remove { padding: .5rem .8rem; border: 1px solid #c00; color: #c00; background: #fff; border-radius: 4px; cursor: pointer; }
    .remove:disabled { opacity: .4; cursor: not-allowed; }
    .add { margin-top: .75rem; padding: .5rem 1rem; border: 1px dashed #003366; color: #003366; background: #fff; border-radius: 4px; cursor: pointer; }
    .submit { display: block; width: 100%; margin-top: 1.5rem; padding: .7rem; border: 0; border-radius: 4px; cursor: pointer; font-weight: 600; color: #fff; background: #003366; }
    .submit:disabled { opacity: .5; cursor: not-allowed; }
    .err { color: #c00; margin-top: .75rem; }
    .ok { color: #0a7a2f; margin-top: .75rem; }
  `]
})
export class EnrolarComponent implements OnInit {
  private api = inject(ApiService);

  periodoAcademico = signal('');
  metodoPago = signal('');
  pagoInfo = signal('');
  secciones = signal<SeccionCurso[]>([]);
  detalles = signal<{ idSeccionCurso: string }[]>([{ idSeccionCurso: '' }]);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  ngOnInit(): void {
    this.api.list<SeccionCurso>('/api/v1/secciones-curso').subscribe({
      next: (data) => this.secciones.set((data ?? []).filter((s) => s.activo)),
      error: () => this.secciones.set([]),
    });
  }

  onMetodoPagoChange(): void {
    this.pagoInfo.set(PAGO_INFO[this.metodoPago()] ?? '');
  }

  addDetalle(): void {
    this.detalles.set([...this.detalles(), { idSeccionCurso: '' }]);
  }

  removeDetalle(i: number): void {
    this.detalles.set(this.detalles().filter((_, idx) => idx !== i));
  }

  submit(): void {
    const validDetalles = this.detalles().filter((d) => d.idSeccionCurso);
    if (!this.periodoAcademico() || !this.metodoPago() || validDetalles.length === 0) {
      this.error.set('Completa el periodo, método de pago y al menos una sección.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);
    const payload = {
      periodoAcademico: this.periodoAcademico(),
      metodoPago: this.metodoPago(),
      detalles: validDetalles.map((d) => ({ idSeccionCurso: Number(d.idSeccionCurso) })),
    };
    this.api.post('/api/v1/matriculas/enrolar', payload).subscribe({
      next: () => {
        this.success.set(true);
        this.saving.set(false);
        this.periodoAcademico.set('');
        this.metodoPago.set('');
        this.pagoInfo.set('');
        this.detalles.set([{ idSeccionCurso: '' }]);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al enrolar.');
        this.saving.set(false);
      },
    });
  }
}
