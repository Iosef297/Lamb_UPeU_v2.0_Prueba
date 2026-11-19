import { Component, computed, input, signal } from '@angular/core';

export interface EventoDia {
  fecha: string; // yyyy-MM-dd
  texto: string;
  color: string;
}

interface Celda {
  dia: number;
  fecha: string;
  fuera: boolean;
  finde: boolean;
  hoy: boolean;
  eventos: EventoDia[];
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** Vista MES del calendario del diseño. */
@Component({
  selector: 'ac-calendario-mes',
  template: `
    <div class="ac-cal-toolbar">
      <div style="display: flex; gap: 8px">
        <button type="button" class="ac-mini-btn" (click)="mover(-1)">ANTERIOR</button>
        <button type="button" class="ac-mini-btn y" (click)="irHoy()">HOY</button>
        <button type="button" class="ac-mini-btn" (click)="mover(1)">SIGUIENTE</button>
      </div>
      <h3>{{ titulo() }}</h3>
      <span style="font-size: 0.75rem; color: #94a3b8">{{ eventos().length }} evento(s) del calendario académico</span>
    </div>
    <div class="ac-cal-grid">
      @for (d of dias; track d) {
        <div class="ac-cal-dow">{{ d }}</div>
      }
      @for (c of celdas(); track c.fecha) {
        <div class="ac-cal-day" [class.finde]="c.finde" [class.fuera]="c.fuera" [class.hoy]="c.hoy">
          <div style="margin-bottom: 4px"><span class="num">{{ c.dia }}</span></div>
          @for (e of c.eventos; track $index) {
            <div class="ac-cal-evt" [style.background]="e.color + '18'" [style.color]="e.color" [title]="e.texto">{{ e.texto }}</div>
          }
        </div>
      }
    </div>
  `,
})
export class CalendarioMes {
  readonly eventos = input<EventoDia[]>([]);
  readonly dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  private readonly base = signal(new Date());

  readonly titulo = computed(() => `${MESES[this.base().getMonth()]} ${this.base().getFullYear()}`);

  readonly celdas = computed<Celda[]>(() => {
    const b = this.base();
    const primero = new Date(b.getFullYear(), b.getMonth(), 1);
    const inicio = new Date(primero);
    inicio.setDate(1 - primero.getDay());
    const hoy = iso(new Date());
    const porFecha = new Map<string, EventoDia[]>();
    for (const e of this.eventos()) {
      porFecha.set(e.fecha, [...(porFecha.get(e.fecha) ?? []), e]);
    }
    const celdas: Celda[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const f = iso(d);
      celdas.push({
        dia: d.getDate(),
        fecha: f,
        fuera: d.getMonth() !== b.getMonth(),
        finde: d.getDay() === 0 || d.getDay() === 6,
        hoy: f === hoy,
        eventos: porFecha.get(f) ?? [],
      });
    }
    // Sin sexta semana si toda queda fuera del mes
    return celdas.slice(35).every((c) => c.fuera) ? celdas.slice(0, 35) : celdas;
  });

  mover(delta: number): void {
    const b = this.base();
    this.base.set(new Date(b.getFullYear(), b.getMonth() + delta, 1));
  }

  irHoy(): void {
    this.base.set(new Date());
  }
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
