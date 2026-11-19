import { Component, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { AcademicoApi, Fila, Opcion } from '../academico-api';
import { CalendarioHorario, EventoCal } from '../comun/calendario-horario';
import { textoError } from '../comun/formulario-modal';
import { PALETA } from '../docente/mi-horario';
import { REF_PERSONA } from '../modulos';

type Por = 'grupo' | 'ambiente' | 'docente' | 'alumno';

/**
 * Horarios en calendario para gestion (soporte): el mismo componente del LAMB para ver
 * el horario de un grupo, de un ambiente, de un docente o de un alumno (con sus cruces).
 */
@Component({
  selector: 'ac-horarios-vista',
  imports: [CalendarioHorario],
  template: `
    <div class="ac-page">
      <div class="ac-head">
        <div>
          <h2>Horarios en calendario</h2>
          <p class="sub">Clases reales del periodo {{ api.periodo() }} (fechas del módulo, sin días no lectivos)</p>
        </div>
      </div>

      <div class="ac-card">
        <div class="ac-filtros" style="border-bottom: none">
          <div class="ac-field">
            <label>Ver horario de</label>
            <select class="ac-input" (change)="por.set($any($event.target).value); valor.set('')">
              <option value="grupo">Grupo</option>
              <option value="ambiente">Ambiente</option>
              <option value="docente">Docente</option>
              <option value="alumno">Alumno (soporte)</option>
            </select>
          </div>
          <div class="ac-field" style="min-width: 320px">
            <label>{{ etiquetaPor() }}</label>
            @if (por() === 'alumno') {
              <select class="ac-input" (change)="elegirAlumno($any($event.target).value)">
                <option value="">— Elige —</option>
                @for (o of alumnos(); track o.valor) {
                  <option [value]="o.valor">{{ o.etiqueta }}</option>
                }
              </select>
            } @else {
              <select class="ac-input" (change)="valor.set($any($event.target).value)">
                <option value="">— Elige —</option>
                @for (o of opciones(); track o.valor) {
                  <option [value]="o.valor" [selected]="'' + o.valor === valor()">{{ o.etiqueta }}</option>
                }
              </select>
            }
          </div>
        </div>
      </div>

      @if (error()) {
        <div class="ac-alerta error">{{ error() }}</div>
      }
      @if (cruces() > 0) {
        <div class="ac-alerta aviso">{{ cruces() }} clase(s) con cruce (en rojo).</div>
      }

      @if (cargando()) {
        <div class="ac-cargando"><span class="ac-spin"></span> Cargando…</div>
      } @else {
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px">
          @for (g of leyenda(); track g.id) {
            <button type="button" class="ac-chip" [style.border-color]="g.color" (click)="seleccion.set(seleccion() === g.id ? null : g.id)">
              <b [style.color]="g.color">{{ g.indice }}</b> {{ g.texto }}
            </button>
          }
        </div>
        <ac-calendario-horario [eventos]="eventos()" [seleccion]="seleccion()" [irA]="irA()" (elegir)="seleccion.set(seleccion() === $event ? null : $event)" />
      }
    </div>
  `,
})
export class HorariosVista {
  readonly api = inject(AcademicoApi);

  readonly por = signal<Por>('grupo');
  readonly valor = signal('');
  readonly grupos = signal<Fila[]>([]);
  readonly ambientes = signal<Fila[]>([]);
  readonly personas = signal<Opcion[]>([]);
  readonly matriculas = signal<Fila[]>([]);
  readonly clases = signal<Fila[]>([]);
  readonly crucesAlumno = signal<Set<number>>(new Set());
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly seleccion = signal<string | null>(null);
  readonly irA = signal<string | null>(null);

  // Grupos del periodo y del programa elegidos en el contexto
  private readonly delPeriodo = computed(() =>
    this.grupos().filter(
      (g) => (!this.api.periodo() || g['periodo'] === this.api.periodo()) && (!this.api.programa() || String(g['idPrograma']) === this.api.programa()),
    ),
  );

  readonly etiquetaPor = computed(() => ({ grupo: 'Grupo', ambiente: 'Ambiente', docente: 'Docente', alumno: 'Alumno' })[this.por()]);

  readonly opciones = computed<Opcion[]>(() => {
    const nombres = new Map(this.personas().map((p) => [Number(p.valor), p.etiqueta]));
    if (this.por() === 'grupo') {
      return this.delPeriodo()
        .slice()
        .sort((a, b) => Number(a['ciclo'] ?? 0) - Number(b['ciclo'] ?? 0) || String(a['codigo']).localeCompare(String(b['codigo'])) || String((a['curso'] as Fila)?.['nombre']).localeCompare(String((b['curso'] as Fila)?.['nombre'])))
        .map((g) => ({ valor: g['id'], etiqueta: `Ciclo ${g['ciclo'] ?? '—'} · ${g['codigo']} · ${(g['curso'] as Fila)?.['nombre'] ?? ''}` }));
    }
    if (this.por() === 'ambiente') {
      return this.ambientes().map((a) => ({ valor: a['id'], etiqueta: `${a['codigo']} · ${a['nombre'] ?? ''}` }));
    }
    const ids = [...new Set(this.delPeriodo().flatMap((g) => ((g['docentes'] as Fila[]) ?? []).map((d) => Number(d['idDocente']))))];
    return ids.map((id) => ({ valor: id, etiqueta: nombres.get(id) ?? `Persona #${id}` }));
  });

  readonly alumnos = computed<Opcion[]>(() => {
    const nombres = new Map(this.personas().map((p) => [Number(p.valor), p.etiqueta]));
    const ids = [...new Set(this.matriculas().map((m) => Number(m['idPersona'])))];
    return ids.map((id) => ({ valor: id, etiqueta: nombres.get(id) ?? `Persona #${id}` }));
  });

  // Grupos que entran segun el filtro
  private readonly gruposFiltro = computed<Fila[]>(() => {
    const v = Number(this.valor());
    if (!v) {
      return [];
    }
    const lista = this.delPeriodo();
    switch (this.por()) {
      case 'grupo':
        return lista.filter((g) => Number(g['id']) === v);
      case 'ambiente':
        return lista.filter((g) => ((g['horarios'] as Fila[]) ?? []).some((h) => Number(h['idAmbiente']) === v));
      case 'docente':
        return lista.filter((g) => ((g['docentes'] as Fila[]) ?? []).some((d) => Number(d['idDocente']) === v));
      default: {
        const ids = new Set(
          this.matriculas()
            .filter((m) => Number(m['idPersona']) === v && !String(m['estado'] ?? '').startsWith('ANULAD'))
            .flatMap((m) => ((m['detalles'] as Fila[]) ?? []).map((d) => Number(d['idSeccion']))),
        );
        return lista.filter((g) => ids.has(Number(g['id'])));
      }
    }
  });

  readonly leyenda = computed(() =>
    this.gruposFiltro().map((g, i) => ({
      id: String(g['id']),
      indice: i + 1,
      color: PALETA[i % PALETA.length],
      texto: `${(g['curso'] as Fila)?.['nombre'] ?? ''} · ${g['codigo']}`,
    })),
  );

  readonly eventos = computed<EventoCal[]>(() => {
    const ley = new Map(this.leyenda().map((l) => [l.id, l]));
    const v = Number(this.valor());
    return this.clases()
      .filter((c) => ley.has(String(c['idGrupo'])))
      .filter((c) => this.por() !== 'ambiente' || Number(c['idAmbiente']) === v)
      .filter((c) => this.por() !== 'docente' || c['idDocente'] == null || Number(c['idDocente']) === v)
      .map((c) => {
        const l = ley.get(String(c['idGrupo']))!;
        const ini = String(c['fechaHoraInicio']).slice(0, 16);
        return {
          id: `${c['idHorario']}-${ini}`,
          clave: l.id,
          inicio: ini,
          fin: String(c['fechaHoraFin']).slice(0, 16),
          titulo: String(c['nombreCurso']),
          detalle: `${c['etiquetaTipo'] ?? ''} · Grupo ${c['codigoGrupo']} · Ambiente: ${c['codigoAmbiente'] ?? 'Por confirmar'}`,
          color: l.color,
          indice: l.indice,
          cruce: this.por() === 'alumno' ? this.crucesAlumno().has(Number(c['idHorario'])) : false,
        };
      });
  });

  readonly cruces = computed(() => this.eventos().filter((e) => e.cruce).length);

  constructor() {
    forkJoin({
      grupos: this.api.listar('planificacion', '/api/v1/grupos'),
      ambientes: this.api.listar('planificacion', '/api/v1/ambientes').pipe(catchError(() => of([] as Fila[]))),
      periodos: this.api.listar('planificacion', '/api/v1/periodos-academicos'),
      matriculas: this.api.listar('matricula', '/api/v1/matriculas').pipe(catchError(() => of([] as Fila[]))),
    }).subscribe({
      next: ({ grupos, ambientes, periodos, matriculas }) => {
        this.grupos.set(grupos);
        this.ambientes.set(ambientes);
        this.matriculas.set(matriculas);
        const ids = this.delPeriodo().map((g) => g['id']);
        const per = periodos.find((p) => p['codigo'] === this.api.periodo());
        // El calendario abre en la primera semana del periodo (no en la de hoy, que puede estar fuera de el)
        if (per?.['fechaInicio'] && new Date().toISOString().slice(0, 10) < String(per['fechaInicio'])) {
          this.irA.set(String(per['fechaInicio']));
        }
        if (!ids.length) {
          this.cargando.set(false);
          return;
        }
        this.api
          .get<{ clases: Fila[] }>('planificacion', '/api/v1/vistas/horario-estudiante/ocurrencias', {
            idsGrupo: ids.join(','),
            desde: String(per?.['fechaInicio'] ?? `${new Date().getFullYear()}-01-01`),
            hasta: String(per?.['fechaFin'] ?? `${new Date().getFullYear()}-12-31`),
          })
          .subscribe({
            next: (r) => {
              this.clases.set(r.clases ?? []);
              this.cargando.set(false);
            },
            error: (e) => {
              this.error.set(textoError(e));
              this.cargando.set(false);
            },
          });
      },
      error: (e) => {
        this.error.set(textoError(e));
        this.cargando.set(false);
      },
    });
    this.api.opciones(REF_PERSONA).subscribe((p) => this.personas.set(p));
  }

  /** Alumno: el cruce lo calcula planificacion (vistas/horario-estudiante, flag por bloque). */
  elegirAlumno(v: string): void {
    this.valor.set(v);
    this.crucesAlumno.set(new Set());
    const ids = this.gruposFiltro().map((g) => g['id']);
    if (!ids.length) {
      return;
    }
    this.api.listar('planificacion', '/api/v1/vistas/horario-estudiante', { idsGrupo: ids.join(',') }).subscribe({
      next: (bloques) => this.crucesAlumno.set(new Set(bloques.filter((b) => b['cruce']).map((b) => Number(b['idHorario'])))),
      error: () => this.crucesAlumno.set(new Set()),
    });
  }
}
