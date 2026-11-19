import { Component, computed, inject, output, signal } from '@angular/core';
import { AcademicoApi, Fila } from '../academico-api';

export interface BloqueFranja {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
const CORTO: Record<string, string> = { LUNES: 'Lun', MARTES: 'Mar', MIERCOLES: 'Mié', JUEVES: 'Jue', VIERNES: 'Vie', SABADO: 'Sáb', DOMINGO: 'Dom' };
const TURNO: Record<string, string> = { MANANA: 'Mañana', TARDE: 'Tarde', NOCHE: 'Noche' };

/**
 * Editor de horario por franjas pedagogicas (como el LAMB): se marcan celdas franja x dia
 * y las franjas seguidas del mismo dia se unen en un solo bloque (horario_unido).
 */
@Component({
  selector: 'ac-selector-franjas',
  styles: `
    table { border-collapse: separate; border-spacing: 2px; width: 100%; font-size: .68rem; }
    th { color: #475569; font-weight: 700; padding: 2px; }
    td.f { color: #64748b; white-space: nowrap; padding: 0 6px 0 0; text-align: right; }
    td.c { height: 20px; border-radius: 4px; background: #f1f5f9; cursor: pointer; text-align: center; }
    td.c:hover { background: #dbeafe; }
    td.c.on { background: #1e3a8a; color: #fff; }
    tr.sep td { padding-top: 6px; color: #94a3b8; font-weight: 700; }
  `,
  template: `
    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; background: #fff">
      <p style="font-size: 0.72rem; color: #475569; margin: 0 0 6px">
        Marca las franjas (clic o arrastra). Las seguidas del mismo día se unen en un bloque.
        <b>{{ resumen() || 'Nada marcado' }}</b>
      </p>
      <table (mouseleave)="arrastrando = false">
        <tr>
          <th></th>
          @for (d of dias; track d) {
            <th>{{ corto[d] }}</th>
          }
        </tr>
        @for (f of franjas(); track f['id']; let i = $index) {
          @if (i === 0 || f['turno'] !== franjas()[i - 1]['turno']) {
            <tr class="sep"><td colspan="8">{{ turno[$any(f['turno'])] }}</td></tr>
          }
          <tr>
            <td class="f">F{{ f['orden'] }} · {{ hora(f['horaInicio']) }}–{{ hora(f['horaFin']) }}</td>
            @for (d of dias; track d) {
              <td
                class="c"
                [class.on]="marcada(d, f)"
                (mousedown)="empezar(d, f)"
                (mouseenter)="arrastrar(d, f)"
                (mouseup)="arrastrando = false"
              ></td>
            }
          </tr>
        }
      </table>
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px">
        <button type="button" class="ac-btn-out" (click)="limpiar()">Limpiar</button>
        <button type="button" class="ac-btn-navy" [disabled]="bloques().length === 0" (click)="aplicar.emit(bloques())">
          Agregar {{ bloques().length }} bloque(s)
        </button>
      </div>
    </div>
  `,
})
export class SelectorFranjas {
  private readonly api = inject(AcademicoApi);
  readonly aplicar = output<BloqueFranja[]>();

  readonly dias = DIAS.slice(0, 6);
  readonly corto = CORTO;
  readonly turno = TURNO;
  readonly franjas = signal<Fila[]>([]);
  readonly sel = signal<Set<string>>(new Set());
  arrastrando = false;
  private valorArrastre = true;

  readonly bloques = computed<BloqueFranja[]>(() => {
    const salida: BloqueFranja[] = [];
    for (const d of this.dias) {
      let actual: BloqueFranja | null = null;
      let anterior = -2;
      for (const f of this.franjas()) {
        const orden = Number(f['orden']);
        if (!this.sel().has(`${d}:${orden}`)) {
          continue;
        }
        if (actual && orden === anterior + 1) {
          actual.horaFin = this.hora(f['horaFin']);
        } else {
          actual = { diaSemana: d, horaInicio: this.hora(f['horaInicio']), horaFin: this.hora(f['horaFin']) };
          salida.push(actual);
        }
        anterior = orden;
      }
    }
    return salida;
  });

  readonly resumen = computed(() => this.bloques().map((b) => `${CORTO[b.diaSemana]} ${b.horaInicio}–${b.horaFin}`).join(' · '));

  constructor() {
    this.api.listar('planificacion', '/api/v1/franjas-horarias').subscribe((f) => this.franjas.set(f));
  }

  marcada(d: string, f: Fila): boolean {
    return this.sel().has(`${d}:${f['orden']}`);
  }

  empezar(d: string, f: Fila): void {
    this.arrastrando = true;
    this.valorArrastre = !this.marcada(d, f);
    this.poner(d, f);
  }

  arrastrar(d: string, f: Fila): void {
    if (this.arrastrando) {
      this.poner(d, f);
    }
  }

  limpiar(): void {
    this.sel.set(new Set());
  }

  hora(v: unknown): string {
    return String(v ?? '').slice(0, 5);
  }

  private poner(d: string, f: Fila): void {
    const s = new Set(this.sel());
    const k = `${d}:${f['orden']}`;
    if (this.valorArrastre) {
      s.add(k);
    } else {
      s.delete(k);
    }
    this.sel.set(s);
  }
}
