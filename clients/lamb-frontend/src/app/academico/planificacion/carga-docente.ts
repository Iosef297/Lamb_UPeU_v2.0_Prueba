import { Component, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { AcademicoApi, Fila, Opcion } from '../academico-api';
import { textoError } from '../comun/formulario-modal';
import { REF_PERSONA } from '../modulos';

interface FilaCarga {
  idDocente: number;
  nombre: string;
  maximas: number | null;
  asignadas: number;
  noLectivas: number;
  grupos: string[];
  uso: number;
}

/** Carga docente del periodo (P7): horas lectivas asignadas en grupos frente a la carga maxima. */
@Component({
  selector: 'ac-carga-docente',
  template: `
    <div class="ac-page">
      <div class="ac-head">
        <div>
          <h2>Carga Docente</h2>
          <p class="sub">Periodo {{ api.periodo() || '—' }} · horas asignadas en grupos frente a la carga lectiva máxima</p>
        </div>
        <div class="acciones"><button type="button" class="ac-btn-out" (click)="cargar()">⟳ Actualizar</button></div>
      </div>

      @if (error()) {
        <div class="ac-alerta error">{{ error() }}</div>
      }

      <div class="ac-stats">
        <div class="ac-stat"><div><p class="val" style="color: #1e3a8a">{{ filas().length }}</p><p class="lbl">Docentes con carga</p></div></div>
        <div class="ac-stat"><div><p class="val" style="color: #7c3aed">{{ totalHoras() }}</p><p class="lbl">Horas lectivas asignadas</p></div></div>
        <div class="ac-stat"><div><p class="val" style="color: #dc2626">{{ excedidos() }}</p><p class="lbl">Superan su carga máxima</p></div></div>
        <div class="ac-stat"><div><p class="val" style="color: #b45309">{{ sinMaximo() }}</p><p class="lbl">Sin carga lectiva registrada</p></div></div>
      </div>

      <div class="ac-card">
        <div class="ac-card-head"><h3>Docentes del periodo</h3></div>
        @if (cargando()) {
          <div class="ac-cargando"><span class="ac-spin"></span> Calculando…</div>
        } @else if (filas().length === 0) {
          <div class="ac-vacio">No hay docentes asignados ni cargas lectivas en el periodo.</div>
        } @else {
          <table class="ac-table">
            <thead><tr><th>DOCENTE</th><th>GRUPOS</th><th>ASIGNADAS</th><th>MÁXIMAS</th><th>NO LECTIVAS</th><th style="min-width: 180px">USO</th></tr></thead>
            <tbody>
              @for (f of filas(); track f.idDocente) {
                <tr>
                  <td class="fuerte">{{ f.nombre }}</td>
                  <td style="white-space: normal">{{ f.grupos.join(', ') || '—' }}</td>
                  <td>{{ f.asignadas }} h</td>
                  <td>{{ f.maximas === null ? '—' : f.maximas + ' h' }}</td>
                  <td>{{ f.noLectivas }} h</td>
                  <td>
                    <div class="ac-barra"><div [style.width.%]="f.uso > 100 ? 100 : f.uso" [style.background]="f.uso > 100 ? '#ef4444' : f.uso >= 90 ? '#f59e0b' : null"></div></div>
                    <span style="font-size: 0.7rem" [style.color]="f.uso > 100 ? '#dc2626' : null">{{ f.maximas === null ? 'sin máximo' : f.uso + ' %' }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class CargaDocente {
  readonly api = inject(AcademicoApi);

  readonly filas = signal<FilaCarga[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalHoras = computed(() => this.filas().reduce((s, f) => s + f.asignadas, 0));
  readonly excedidos = computed(() => this.filas().filter((f) => f.uso > 100).length);
  readonly sinMaximo = computed(() => this.filas().filter((f) => f.maximas === null).length);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    const codigo = this.api.periodo();
    forkJoin({
      periodos: this.api.listar('planificacion', '/api/v1/periodos-academicos'),
      grupos: this.api.listar('planificacion', '/api/v1/grupos'),
      personas: this.api.opciones(REF_PERSONA),
    }).subscribe({
      next: ({ periodos, grupos, personas }) => {
        const periodo = periodos.find((p) => p['codigo'] === codigo);
        const idPeriodo = periodo?.['id'];
        forkJoin({
          lectivas: idPeriodo ? this.api.listar('planificacion', '/api/v1/cargas-lectivas', { idPeriodo }).pipe(catchError(() => of([] as Fila[]))) : of([] as Fila[]),
          noLectivas: idPeriodo ? this.api.listar('planificacion', '/api/v1/cargas-no-lectivas', { idPeriodo }).pipe(catchError(() => of([] as Fila[]))) : of([] as Fila[]),
        }).subscribe(({ lectivas, noLectivas }) => {
          this.filas.set(this.armar(grupos, lectivas, noLectivas, personas, codigo));
          this.cargando.set(false);
        });
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(textoError(e));
      },
    });
  }

  private armar(grupos: Fila[], lectivas: Fila[], noLectivas: Fila[], personas: Opcion[], codigo: string): FilaCarga[] {
    const nombres = new Map(personas.map((p) => [Number(p.valor), p.etiqueta]));
    const mapa = new Map<number, FilaCarga>();
    const fila = (id: number) => {
      if (!mapa.has(id)) {
        mapa.set(id, { idDocente: id, nombre: nombres.get(id) ?? `Docente #${id}`, maximas: null, asignadas: 0, noLectivas: 0, grupos: [], uso: 0 });
      }
      return mapa.get(id)!;
    };
    // Los grupos anulados no cuentan (misma regla que el backend al validar la carga)
    for (const g of grupos.filter((x) => x['estado'] !== 'ANULADO' && (!codigo || x['periodo'] === codigo))) {
      for (const d of (g['docentes'] as Fila[]) ?? []) {
        const f = fila(Number(d['idDocente']));
        f.asignadas += Number(d['horasSemanales'] ?? 0);
        f.grupos.push(`${(g['curso'] as Fila)?.['codigo'] ?? ''} ${g['codigo']} (${String(d['rol']).toLowerCase()})`);
      }
    }
    for (const l of lectivas) {
      fila(Number(l['idDocente'])).maximas = Number(l['horasMaximas']);
    }
    for (const n of noLectivas) {
      fila(Number(n['idDocente'])).noLectivas += Number(n['horasSemanales'] ?? 0);
    }
    for (const f of mapa.values()) {
      f.uso = f.maximas ? Math.round((f.asignadas * 100) / f.maximas) : 0;
    }
    return [...mapa.values()].sort((a, b) => b.uso - a.uso || a.nombre.localeCompare(b.nombre));
  }
}
