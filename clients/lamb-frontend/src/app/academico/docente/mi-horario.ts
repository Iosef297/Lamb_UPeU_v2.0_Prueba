import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { AcademicoApi, Fila, Opcion } from '../academico-api';
import { CalendarioHorario, EventoCal } from '../comun/calendario-horario';
import { textoError } from '../comun/formulario-modal';
import { SesionUi } from '../comun/sesion-ui';
import { REF_PERSONA } from '../modulos';

export const PALETA = ['#2563EB', '#16A34A', '#F59E0B', '#9333EA', '#0891B2', '#DB2777', '#EA580C', '#4F46E5', '#059669', '#B45309'];

interface Tarjeta {
  indice: number;
  grupo: Fila;
  color: string;
  titular: string;
  resumen: string;
  ambientes: string;
  modulos: { nombre: string; inicio: string; fin: string; docente: string; resumen: string }[];
  inicio: string | null;
  fin: string | null;
}

/**
 * Horario del docente como el boton "Horario" del LAMB: tarjetas numeradas de sus cursos con el chip
 * "Horario" y el calendario Semana / Mes / Dia con las clases reales (fechas del modulo, sin no lectivos).
 */
@Component({
  selector: 'ac-mi-horario',
  imports: [CalendarioHorario],
  template: `
    <div class="ac-page">
      <div class="ac-head">
        <div>
          <h2>Mi horario</h2>
          <p class="sub">Clases que dictas{{ api.periodo() ? ' en ' + api.periodo() : '' }} · {{ eventos().length }} clase(s) en el periodo</p>
        </div>
      </div>

      @if (error()) {
        <div class="ac-alerta error">{{ error() }}</div>
      }
      @if (cruces() > 0) {
        <div class="ac-alerta aviso">Tienes {{ cruces() }} clase(s) que se cruzan entre tus grupos (en rojo en el calendario).</div>
      }

      @if (cargando()) {
        <div class="ac-cargando"><span class="ac-spin"></span> Cargando horario…</div>
      } @else {
        <div style="display: grid; grid-template-columns: minmax(260px, 340px) 1fr; gap: 16px; align-items: start">
          <div style="display: flex; flex-direction: column; gap: 10px; max-height: 680px; overflow: auto; padding-right: 4px">
            @if (tarjetas().length === 0) {
              <div class="ac-card"><div class="ac-vacio">No tienes cursos con horario visible en este periodo.</div></div>
            }
            @for (t of tarjetas(); track t.grupo['id']) {
              <div
                class="ac-card"
                style="margin: 0; padding: 12px 14px; border: 2px solid transparent; cursor: pointer"
                [style.border-color]="seleccion() === '' + t.grupo['id'] ? '#F97316' : 'transparent'"
                (click)="seleccionar(t)"
              >
                <div style="display: flex; gap: 10px; align-items: flex-start">
                  <span
                    style="min-width: 24px; height: 24px; border-radius: 999px; color: #fff; font-weight: 800; font-size: 0.75rem; display: inline-flex; align-items: center; justify-content: center"
                    [style.background]="t.color"
                    >{{ t.indice }}</span
                  >
                  <div style="min-width: 0; flex: 1">
                    <p style="font-weight: 700; color: #0f2557; margin: 0; font-size: 0.85rem">{{ curso(t)['nombre'] }}</p>
                    <p style="font-size: 0.7rem; color: #64748b; margin: 2px 0 0">{{ curso(t)['codigo'] }} · grupo {{ t.grupo['codigo'] }}</p>
                  </div>
                </div>
                <p style="font-size: 0.72rem; color: #475569; margin: 8px 0 2px">Docente titular: {{ t.titular }}</p>
                <p style="font-size: 0.72rem; color: #475569; margin: 0 0 2px">{{ t.resumen || 'Sin horario' }}</p>
                <p style="font-size: 0.72rem; color: #475569; margin: 0">Ambiente: {{ t.ambientes }}</p>
                @if (!t.resumen) {
                  <p style="font-size: 0.68rem; color: #b45309; margin: 4px 0 0">Si no aparece horario, guíate por los datos de la tarjeta.</p>
                }
                @if (t.modulos.length > 1) {
                  <details style="margin-top: 6px" (click)="$event.stopPropagation()">
                    <summary style="font-size: 0.7rem; color: #1e3a8a; cursor: pointer">{{ t.modulos.length }} módulos</summary>
                    @for (m of t.modulos; track m.nombre) {
                      <p style="font-size: 0.68rem; color: #475569; margin: 4px 0 0">
                        <b>{{ m.nombre }}</b> · {{ m.inicio }} → {{ m.fin }}<br />{{ m.docente }} · {{ m.resumen }}
                      </p>
                    }
                  </details>
                }
                <div style="margin-top: 8px">
                  <button type="button" class="ac-chip" (click)="$event.stopPropagation(); seleccionar(t)">Horario</button>
                </div>
              </div>
            }
          </div>

          <ac-calendario-horario
            [eventos]="eventos()"
            [seleccion]="seleccion()"
            [irA]="irA()"
            (elegir)="elegirBloque($event)"
            (rango)="rango.set($event)"
          />
        </div>
      }
    </div>
  `,
})
export class MiHorario {
  readonly api = inject(AcademicoApi);
  private readonly sesion = inject(SesionUi);

  readonly grupos = signal<Fila[]>([]);
  readonly clases = signal<Fila[]>([]);
  readonly personas = signal<Map<number, string>>(new Map());
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly seleccion = signal<string | null>(null);
  readonly irA = signal<string | null>(null);
  readonly rango = signal<{ desde: string; hasta: string } | null>(null);

  private readonly yo = computed(() => Number(this.sesion.auth.idPersona()));

  // Solo los grupos del periodo donde mi asignacion ve el horario
  private readonly misGrupos = computed(() => {
    const p = this.api.periodo();
    return this.grupos().filter((g) => {
      const mia = ((g['docentes'] as Fila[]) ?? []).find((d) => Number(d['idDocente']) === this.yo());
      return mia && mia['verHorario'] !== false && (!p || g['periodo'] === p);
    });
  });

  readonly tarjetas = computed<Tarjeta[]>(() =>
    this.misGrupos().map((g, i) => {
      const horarios = ((g['horarios'] as Fila[]) ?? []).filter((h) => h['activo'] !== false && this.loDicto(h));
      const titular = ((g['docentes'] as Fila[]) ?? []).find((d) => d['rol'] === 'TITULAR');
      const ambientes = [...new Set(horarios.map((h) => String(h['codigoAmbiente'] ?? 'Por confirmar')))];
      const propias = this.clases().filter((c) => Number(c['idGrupo']) === Number(g['id']));
      const porModulo = new Map<string, Fila[]>();
      horarios.forEach((h) => porModulo.set(String(h['nombreModulo'] ?? 'Regular'), [...(porModulo.get(String(h['nombreModulo'] ?? 'Regular')) ?? []), h]));
      return {
        indice: i + 1,
        grupo: g,
        color: PALETA[i % PALETA.length],
        titular: titular ? this.nombre(Number(titular['idDocente'])) : 'Sin titular',
        resumen: horarios.map((h) => `${String(h['diaSemana']).slice(0, 3)} ${String(h['horaInicio']).slice(0, 5)}–${String(h['horaFin']).slice(0, 5)}`).join(' · '),
        ambientes: ambientes.length ? ambientes.join(', ') : 'Por confirmar',
        modulos: [...porModulo.entries()].map(([nombre, hs]) => ({
          nombre,
          inicio: String(hs[0]['fechaInicio'] ?? propias[0]?.['moduloInicio'] ?? '—'),
          fin: String(hs[0]['fechaFin'] ?? propias[0]?.['moduloFin'] ?? '—'),
          docente: hs[0]['idDocente'] ? this.nombre(Number(hs[0]['idDocente'])) : 'Docente del grupo',
          resumen: hs.map((h) => `${String(h['diaSemana']).slice(0, 3)} ${String(h['horaInicio']).slice(0, 5)}`).join(' · '),
        })),
        inicio: propias.length ? String(propias.map((c) => c['moduloInicio']).sort()[0]) : null,
        fin: propias.length ? String(propias.map((c) => c['moduloFin']).sort().reverse()[0]) : null,
      };
    }),
  );

  readonly eventos = computed<EventoCal[]>(() => {
    const porGrupo = new Map(this.tarjetas().map((t) => [Number(t.grupo['id']), t]));
    const mias = this.clases().filter((c) => porGrupo.has(Number(c['idGrupo'])) && (c['idDocente'] == null || Number(c['idDocente']) === this.yo()));
    return mias.map((c) => {
      const t = porGrupo.get(Number(c['idGrupo']))!;
      const ini = String(c['fechaHoraInicio']).slice(0, 16);
      const fin = String(c['fechaHoraFin']).slice(0, 16);
      // Cruce: otra clase mia de otro grupo a la misma hora
      const cruce = mias.some(
        (o) => o !== c && Number(o['idGrupo']) !== Number(c['idGrupo']) && String(o['fechaHoraInicio']).slice(0, 16) < fin && String(o['fechaHoraFin']).slice(0, 16) > ini,
      );
      return {
        id: `${c['idHorario']}-${ini}`,
        clave: String(c['idGrupo']),
        inicio: ini,
        fin,
        titulo: String(c['nombreCurso']),
        detalle: `${c['etiquetaTipo'] ?? ''} · Grupo ${c['codigoGrupo']} · Ambiente: ${c['codigoAmbiente'] ?? 'Por confirmar'}${c['nombreModulo'] ? ' · ' + c['nombreModulo'] : ''}`,
        color: t.color,
        indice: t.indice,
        cruce,
      };
    });
  });

  readonly cruces = computed(() => this.eventos().filter((e) => e.cruce).length);

  constructor() {
    this.api.opciones(REF_PERSONA).subscribe((p: Opcion[]) => this.personas.set(new Map(p.map((o) => [Number(o.valor), o.etiqueta]))));
    forkJoin({
      grupos: this.api.listar('planificacion', '/api/v1/vistas/mis-grupos'),
      periodos: this.api.listar('planificacion', '/api/v1/periodos-academicos'),
    })
      .pipe(
        switchMap(({ grupos, periodos }) => {
          this.grupos.set(grupos);
          const ids = this.misGrupos().map((g) => g['id']);
          const per = periodos.find((p) => p['codigo'] === this.api.periodo());
          const desde = String(per?.['fechaInicio'] ?? `${new Date().getFullYear()}-01-01`);
          const hasta = String(per?.['fechaFin'] ?? `${new Date().getFullYear()}-12-31`);
          return ids.length
            ? this.api.get<{ clases: Fila[] }>('planificacion', '/api/v1/vistas/horario-estudiante/ocurrencias', { idsGrupo: ids.join(','), desde, hasta })
            : of({ clases: [] as Fila[] });
        }),
      )
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
  }

  curso(t: Tarjeta): Fila {
    return (t.grupo['curso'] as Fila) ?? {};
  }

  /** Chip "Horario": selecciona el curso y, si el calendario esta fuera de su modulo, salta a su inicio. */
  seleccionar(t: Tarjeta): void {
    this.seleccion.set(String(t.grupo['id']));
    const r = this.rango();
    if (t.inicio && r && (r.hasta < t.inicio || (t.fin && r.desde > t.fin))) {
      this.irA.set(null);
      queueMicrotask(() => this.irA.set(t.inicio));
    }
  }

  elegirBloque(clave: string): void {
    this.seleccion.set(this.seleccion() === clave ? null : clave);
  }

  private loDicto(h: Fila): boolean {
    return h['idDocente'] == null || Number(h['idDocente']) === this.yo();
  }

  private nombre(id: number): string {
    return this.personas().get(id) ?? `Persona #${id}`;
  }
}
