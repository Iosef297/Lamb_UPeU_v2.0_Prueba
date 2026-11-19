import { Component, computed, effect, input, output, signal } from '@angular/core';

/** Evento del calendario: una clase (con hora) o una actividad de todo el dia. */
export interface EventoCal {
  id: string;
  // Curso o grupo al que pertenece: sirve para seleccionar y resaltar
  clave: string;
  inicio: string; // yyyy-MM-ddTHH:mm o yyyy-MM-dd
  fin: string;
  titulo: string;
  detalle?: string;
  color: string;
  // Numero del curso en la lista de tarjetas (como el LAMB)
  indice?: number;
  cruce?: boolean;
  todoElDia?: boolean;
}

type Vista = 'Semana' | 'Mes' | 'Dia';

interface Bloque {
  e: EventoCal;
  top: number;
  alto: number;
  carril: number;
  carriles: number;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const PX_HORA = 46;

/**
 * Calendario reutilizable del LAMB (horario y actividades): vistas Semana / Mes / Dia,
 * navegacion anterior / hoy / siguiente, dia de hoy resaltado, tooltip, indice por curso,
 * contador y puntos de color en la vista Mes, y cruces en rojo.
 */
@Component({
  selector: 'ac-calendario-horario',
  styles: `
    :host { display: block; }
    .bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;
      background: linear-gradient(90deg, #0f2557, #1e3a8a); color: #fff; padding: 10px 14px; border-radius: 14px 14px 0 0; }
    .bar .nav { display: flex; gap: 4px; align-items: center; background: rgba(255,255,255,.1); border-radius: 12px; padding: 3px 6px; }
    .bar button { color: #fff; font-size: .8rem; padding: 3px 8px; border-radius: 8px; }
    .bar button.y { background: #fbbf24; color: #0f2557; font-weight: 700; }
    .bar .tit { font-weight: 700; font-size: .9rem; }
    .seg { display: flex; background: rgba(255,255,255,.12); border-radius: 10px; padding: 2px; }
    .seg button.on { background: #fff; color: #0f2557; font-weight: 700; }
    .cuerpo { background: #fff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 14px 14px; overflow: auto; }
    .cab { display: grid; position: sticky; top: 0; z-index: 3; background: #fff; border-bottom: 1px solid #e2e8f0; }
    .cab div { text-align: center; padding: 6px 2px; font-size: .72rem; font-weight: 700; color: #475569; }
    .cab .hoy { background: #fef3c7; color: #92400e; border-radius: 8px; }
    .todo { display: grid; border-bottom: 1px solid #e2e8f0; min-height: 4px; }
    .todo .celda { padding: 2px; border-left: 1px solid #f1f5f9; }
    .chip { display: block; font-size: .66rem; font-weight: 600; border-radius: 6px; padding: 1px 6px; margin-bottom: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
    .grilla { display: grid; position: relative; }
    .horas span { position: absolute; right: 6px; font-size: .62rem; color: #94a3b8; transform: translateY(-6px); }
    .col { position: relative; border-left: 1px solid #f1f5f9; }
    .col.hoy { background: #fffbeb; }
    .linea { position: absolute; left: 0; right: 0; border-top: 1px solid #f1f5f9; }
    .bloque { position: absolute; border-radius: 8px; padding: 3px 5px; font-size: .66rem; color: #fff; overflow: hidden;
      cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.15); transition: opacity .15s, transform .15s; }
    .bloque .num { display: inline-flex; align-items: center; justify-content: center; min-width: 16px; height: 16px; border-radius: 999px;
      background: rgba(255,255,255,.9); color: #0f2557; font-weight: 800; font-size: .6rem; margin-right: 3px; }
    .bloque.sel { outline: 3px solid #f97316; transform: scale(1.02); z-index: 2; }
    .bloque.tenue { opacity: .3; }
    .bloque.cruce { background: #dc2626 !important; }
    .mes { display: grid; grid-template-columns: repeat(7, 1fr); }
    .mes .dow { text-align: center; font-size: .7rem; font-weight: 700; color: #64748b; padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
    .mes .dia { min-height: 86px; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 4px; cursor: pointer; }
    .mes .dia.fuera { background: #f8fafc; color: #cbd5e1; }
    .mes .dia.hoy { background: #fef3c7; }
    .mes .n { font-size: .72rem; font-weight: 700; color: #334155; }
    .cont { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; border-radius: 999px;
      background: #dc2626; color: #fff; font-size: .62rem; font-weight: 800; margin-left: 4px; }
    .puntos { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 6px; }
    .punto { width: 8px; height: 8px; border-radius: 999px; }
  `,
  template: `
    <div class="bar">
      <div class="nav">
        <button type="button" title="Anterior" (click)="mover(-1)">←</button>
        <button type="button" class="y" (click)="irHoy()">Hoy</button>
        <button type="button" title="Siguiente" (click)="mover(1)">→</button>
      </div>
      <span class="tit">{{ titulo() }}</span>
      <div style="display: flex; gap: 8px; align-items: center">
        <span style="font-size: .72rem; opacity: .85">{{ enRango() }} {{ etiquetaConteo() }}</span>
        <div class="seg">
          @for (v of vistas; track v) {
            <button type="button" [class.on]="vista() === v" (click)="vista.set(v)">{{ v === 'Dia' ? 'Día' : v }}</button>
          }
        </div>
      </div>
    </div>

    <div class="cuerpo" [style.max-height.px]="altoMax()">
      @if (vista() === 'Mes') {
        <div class="mes">
          @for (d of diasNombre; track d) {
            <div class="dow">{{ d }}</div>
          }
          @for (c of celdasMes(); track c.fecha) {
            <div class="dia" [class.fuera]="c.fuera" [class.hoy]="c.hoy" (click)="abrirDia(c.fecha)" [title]="c.tooltip">
              <span class="n">{{ c.n }}</span>
              @if (modoMes() === 'contador') {
                @if (c.clases > 0) {
                  <span class="cont">{{ c.clases }}</span>
                }
                <div class="puntos">
                  @for (p of c.puntos; track p.clave) {
                    <span class="punto" [style.background]="p.color" [style.outline]="p.clave === seleccion() ? '2px solid #f97316' : null"></span>
                  }
                </div>
              } @else {
                <div style="margin-top: 4px">
                  @for (e of c.eventos.slice(0, 3); track e.id) {
                    <span class="chip" [style.background]="e.color + '22'" [style.color]="e.color" [title]="tooltip(e)" (click)="$event.stopPropagation(); elegir.emit(e.clave)">{{ e.titulo }}</span>
                  }
                  @if (c.eventos.length > 3) {
                    <span style="font-size: .62rem; color: #64748b">+{{ c.eventos.length - 3 }} más</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="cab" [style.grid-template-columns]="columnas()">
          <div></div>
          @for (d of diasVista(); track d.fecha) {
            <div [class.hoy]="d.hoy">{{ d.nombre }} {{ d.n }}</div>
          }
        </div>
        @if (hayTodoElDia()) {
          <div class="todo" [style.grid-template-columns]="columnas()">
            <div style="font-size: .6rem; color: #94a3b8; padding: 4px">todo el día</div>
            @for (d of diasVista(); track d.fecha) {
              <div class="celda">
                @for (e of todoElDiaDe(d.fecha); track e.id) {
                  <span class="chip" [style.background]="e.color + '22'" [style.color]="e.color" [title]="tooltip(e)" (click)="elegir.emit(e.clave)">{{ e.titulo }}</span>
                }
              </div>
            }
          </div>
        }
        <div class="grilla" [style.grid-template-columns]="columnas()" [style.height.px]="(horaFin() - horaIni()) * pxHora">
          <div class="horas" style="position: relative">
            @for (h of horas(); track h) {
              <span [style.top.px]="(h - horaIni()) * pxHora">{{ etiquetaHora(h) }}</span>
            }
          </div>
          @for (d of diasVista(); track d.fecha) {
            <div class="col" [class.hoy]="d.hoy">
              @for (h of horas(); track h) {
                <div class="linea" [style.top.px]="(h - horaIni()) * pxHora"></div>
              }
              @for (b of bloquesDe(d.fecha); track b.e.id) {
                <div
                  class="bloque"
                  [class.sel]="seleccion() === b.e.clave"
                  [class.tenue]="!!seleccion() && seleccion() !== b.e.clave"
                  [class.cruce]="b.e.cruce"
                  [style.background]="b.e.color"
                  [style.top.px]="b.top"
                  [style.height.px]="b.alto"
                  [style.left.%]="(b.carril * 100) / b.carriles"
                  [style.width]="'calc(' + 100 / b.carriles + '% - 3px)'"
                  [title]="tooltip(b.e)"
                  (click)="elegir.emit(b.e.clave)"
                >
                  @if (b.e.indice) {
                    <span class="num">{{ b.e.indice }}</span>
                  }
                  @if (b.e.cruce) {
                    
                  }
                  <b>{{ b.e.titulo }}</b>
                  @if (b.alto > 34) {
                    <div style="opacity: .9">{{ b.e.inicio.slice(11, 16) }}–{{ b.e.fin.slice(11, 16) }}</div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CalendarioHorario {
  readonly eventos = input<EventoCal[]>([]);
  readonly seleccion = input<string | null>(null);
  // Fecha a la que saltar (al pulsar el chip "Horario" de una tarjeta)
  readonly irA = input<string | null>(null);
  readonly modoMes = input<'contador' | 'lista'>('contador');
  readonly vistaInicial = input<Vista>('Semana');
  readonly altoMax = input(620);
  readonly etiquetaConteo = input('clase(s)');
  readonly elegir = output<string>();
  readonly rango = output<{ desde: string; hasta: string }>();

  readonly vistas: Vista[] = ['Semana', 'Mes', 'Dia'];
  readonly diasNombre = DIAS;
  readonly pxHora = PX_HORA;
  readonly vista = signal<Vista>('Semana');
  readonly fecha = signal(hoyIso());

  constructor() {
    effect(() => this.vista.set(this.vistaInicial()));
    effect(() => {
      const f = this.irA();
      if (f) {
        this.fecha.set(f.slice(0, 10));
      }
    });
    effect(() => this.rango.emit(this.rangoVisible()));
  }

  readonly rangoVisible = computed(() => {
    const f = parse(this.fecha());
    if (this.vista() === 'Dia') {
      return { desde: this.fecha(), hasta: this.fecha() };
    }
    if (this.vista() === 'Semana') {
      const ini = sumar(f, -f.getDay());
      return { desde: iso(ini), hasta: iso(sumar(ini, 6)) };
    }
    const primero = new Date(f.getFullYear(), f.getMonth(), 1);
    const ini = sumar(primero, -primero.getDay());
    return { desde: iso(ini), hasta: iso(sumar(ini, 41)) };
  });

  readonly titulo = computed(() => {
    const f = parse(this.fecha());
    if (this.vista() === 'Mes') {
      return `${MESES_LARGO[f.getMonth()]} ${f.getFullYear()}`;
    }
    if (this.vista() === 'Dia') {
      return `${DIAS[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]}, ${f.getFullYear()}`;
    }
    const { desde, hasta } = this.rangoVisible();
    const a = parse(desde);
    const b = parse(hasta);
    return `${MESES[a.getMonth()]} ${a.getDate()} - ${MESES[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`;
  });

  readonly diasVista = computed(() => {
    const { desde } = this.rangoVisible();
    const n = this.vista() === 'Dia' ? 1 : 7;
    const hoy = hoyIso();
    return Array.from({ length: n }, (_, i) => {
      const d = sumar(parse(desde), i);
      return { fecha: iso(d), nombre: DIAS[d.getDay()], n: d.getDate(), hoy: iso(d) === hoy };
    });
  });

  readonly columnas = computed(() => `52px repeat(${this.diasVista().length}, minmax(0, 1fr))`);

  private readonly visibles = computed(() => {
    const { desde, hasta } = this.rangoVisible();
    return this.eventos().filter((e) => e.fin.slice(0, 10) >= desde && e.inicio.slice(0, 10) <= hasta);
  });

  readonly enRango = computed(() => this.visibles().length);

  readonly horaIni = computed(() => {
    if (this.vista() === 'Dia') {
      return 0;
    }
    const min = Math.min(...this.conHora().map((e) => Number(e.inicio.slice(11, 13))), 7);
    return Math.max(6, Math.min(min, 7));
  });

  readonly horaFin = computed(() => {
    if (this.vista() === 'Dia') {
      return 24;
    }
    const max = Math.max(...this.conHora().map((e) => Math.ceil(minutos(e.fin) / 60)), 19);
    return Math.min(24, max + 1);
  });

  readonly horas = computed(() => Array.from({ length: this.horaFin() - this.horaIni() }, (_, i) => this.horaIni() + i));

  private readonly conHora = computed(() => this.visibles().filter((e) => !e.todoElDia));
  readonly hayTodoElDia = computed(() => this.visibles().some((e) => e.todoElDia));

  todoElDiaDe(fecha: string): EventoCal[] {
    return this.visibles().filter((e) => e.todoElDia && e.inicio.slice(0, 10) <= fecha && e.fin.slice(0, 10) >= fecha);
  }

  bloquesDe(fecha: string): Bloque[] {
    const del = this.conHora()
      .filter((e) => e.inicio.slice(0, 10) === fecha)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
    // Carriles: los bloques que se pisan se ponen lado a lado
    const fines: number[] = [];
    const salida: Bloque[] = [];
    for (const e of del) {
      const ini = minutos(e.inicio);
      let carril = fines.findIndex((f) => f <= ini);
      if (carril < 0) {
        carril = fines.length;
        fines.push(0);
      }
      fines[carril] = minutos(e.fin);
      salida.push({
        e,
        top: ((ini - this.horaIni() * 60) * PX_HORA) / 60,
        alto: Math.max(18, ((minutos(e.fin) - ini) * PX_HORA) / 60 - 2),
        carril,
        carriles: 1,
      });
    }
    const total = Math.max(1, fines.length);
    return salida.map((b) => ({ ...b, carriles: total }));
  }

  readonly celdasMes = computed(() => {
    const { desde } = this.rangoVisible();
    const mes = parse(this.fecha()).getMonth();
    const hoy = hoyIso();
    return Array.from({ length: 42 }, (_, i) => {
      const d = sumar(parse(desde), i);
      const f = iso(d);
      const eventos = this.visibles().filter((e) => e.inicio.slice(0, 10) <= f && e.fin.slice(0, 10) >= f);
      const clases = eventos.filter((e) => !e.todoElDia);
      const puntos = [...new Map(eventos.map((e) => [e.clave, { clave: e.clave, color: e.color }])).values()];
      return {
        fecha: f,
        n: d.getDate(),
        fuera: d.getMonth() !== mes,
        hoy: f === hoy,
        eventos,
        clases: clases.length,
        puntos,
        tooltip: eventos.map((e) => this.tooltip(e)).join('\n'),
      };
    });
  });

  tooltip(e: EventoCal): string {
    const hora = e.todoElDia
      ? e.inicio.slice(0, 10) === e.fin.slice(0, 10)
        ? e.inicio.slice(0, 10)
        : `${e.inicio.slice(0, 10)} → ${e.fin.slice(0, 10)}`
      : `${hora12(e.inicio)} - ${hora12(e.fin)}`;
    return `${e.indice ? e.indice + '. ' : ''}${e.titulo} · ${hora}${e.cruce ? ' · CRUCE' : ''}${e.detalle ? '\n' + e.detalle : ''}`;
  }

  etiquetaHora(h: number): string {
    return h === 0 ? '12 a. m.' : h < 12 ? `${h} a. m.` : h === 12 ? '12 p. m.' : `${h - 12} p. m.`;
  }

  mover(n: number): void {
    const f = parse(this.fecha());
    if (this.vista() === 'Mes') {
      this.fecha.set(iso(new Date(f.getFullYear(), f.getMonth() + n, 1)));
    } else {
      this.fecha.set(iso(sumar(f, n * (this.vista() === 'Dia' ? 1 : 7))));
    }
  }

  irHoy(): void {
    this.fecha.set(hoyIso());
  }

  abrirDia(f: string): void {
    this.fecha.set(f);
    this.vista.set('Dia');
  }
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hoyIso(): string {
  return iso(new Date());
}

function parse(f: string): Date {
  const [y, m, d] = f.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function sumar(d: Date, dias: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + dias);
  return r;
}

function minutos(f: string): number {
  return Number(f.slice(11, 13)) * 60 + Number(f.slice(14, 16));
}

function hora12(f: string): string {
  const h = Number(f.slice(11, 13));
  const m = f.slice(14, 16);
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}
