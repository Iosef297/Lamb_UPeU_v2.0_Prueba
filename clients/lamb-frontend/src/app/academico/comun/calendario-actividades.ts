import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { AcademicoApi, Fila } from '../academico-api';
import { CalendarioHorario, EventoCal } from './calendario-horario';
import { textoError } from './formulario-modal';
import { MisGrupos } from './mis-grupos';

interface Actividad {
  origen: string;
  idOrigen: number | null;
  tipo: string;
  titulo: string;
  area: string;
  descripcion: string | null;
  alcance: string | null;
  estado: string | null;
  fechaInicio: string;
  fechaFin: string;
}

interface Respuesta {
  periodo: string;
  total: number;
  actividades: Actividad[];
  urlDocumento: string | null;
  nombreArchivo: string | null;
  fuentesNoDisponibles: string[];
}

const COLOR_TIPO: Record<string, string> = {
  Matricula: '#2563EB',
  'Inicio de clases': '#16A34A',
  'Examen parcial': '#F59E0B',
  'Examen final': '#EA580C',
  'Cierre de notas': '#9333EA',
  'Fin de clases': '#0891B2',
  Evaluacion: '#DB2777',
  'Fecha de pago': '#B45309',
  Feriado: '#DC2626',
};

/**
 * "Mi calendario" del LAMB: actividades de varios dominios (hitos, no lectivos, evaluaciones, pagos)
 * en Mes / Semana / Dia, con el boton "Actividades generales" que abre el documento oficial.
 * En el portal de gestion se puede previsualizar "como alumno".
 */
@Component({
  selector: 'ac-calendario-actividades',
  imports: [CalendarioHorario],
  template: `
    <div class="ac-page">
      <div class="ac-head">
        <div>
          <h2>Calendario de actividades</h2>
          <p class="sub">Hitos, días no lectivos, evaluaciones y fechas de pago del periodo</p>
        </div>
        <div class="acciones" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
          <!-- En el portal el periodo sale del Contexto de trabajo; el docente no tiene esa barra y lo elige aqui -->
          @if (esDocente) {
            <select class="ac-input" style="width: auto; background: #fff" (change)="elegirPeriodo($any($event.target).value)">
              @for (p of periodos(); track p['id']) {
                <option [value]="p['id']" [selected]="p['id'] === idPeriodo()">{{ etiquetaPeriodo(p) }}</option>
              }
            </select>
          } @else {
            <label class="ac-check" style="font-size: 0.8rem; color: #475569; padding: 0; white-space: nowrap; width: auto">
              <input type="checkbox" style="width: auto; margin: 0" [checked]="comoAlumno()" (change)="comoAlumno.set($any($event.target).checked); cargar()" />
              <span>Vista previa como alumno</span>
            </label>
          }
          <span class="ac-badge" style="background: #eff6ff; color: #1e3a8a">{{ datos()?.total ?? 0 }} actividades</span>
          <button type="button" class="ac-btn-y" (click)="verDocumento.set(true)">Actividades generales</button>
        </div>
      </div>

      @if (error()) {
        <div class="ac-alerta error">{{ error() }}</div>
      }
      @if (datos()?.fuentesNoDisponibles?.length) {
        <div class="ac-alerta aviso">No respondió {{ datos()!.fuentesNoDisponibles.join(', ') }}: se muestran las demás actividades.</div>
      }

      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px">
        @for (t of tiposPresentes(); track t) {
          <span class="ac-badge" [style.background]="color(t) + '1A'" [style.color]="color(t)">● {{ t }}</span>
        }
      </div>

      @if (cargando()) {
        <div class="ac-cargando"><span class="ac-spin"></span> Cargando actividades…</div>
      } @else {
        <ac-calendario-horario [eventos]="eventos()" vistaInicial="Mes" modoMes="lista" etiquetaConteo="actividad(es) en vista" [irA]="irA()" />
      }

      @if (verDocumento()) {
        <div class="ac-modal-fondo" style="position: fixed; inset: 0; background: rgba(15, 37, 87, 0.55); z-index: 50; display: flex; align-items: center; justify-content: center" (click)="verDocumento.set(false)">
          <div class="ac-card" style="width: min(960px, 94vw); height: min(80vh, 760px); margin: 0; display: flex; flex-direction: column" (click)="$event.stopPropagation()">
            <div class="ac-card-head">
              <h3>Actividades generales · {{ datos()?.periodo }}</h3>
              <div style="display: flex; gap: 8px">
                @if (datos()?.urlDocumento) {
                  <a class="ac-btn-out" style="text-decoration: none" [href]="datos()!.urlDocumento" target="_blank" rel="noopener">↗ Abrir en pestaña nueva</a>
                }
                <button type="button" class="ac-btn-navy" (click)="verDocumento.set(false)">CERRAR</button>
              </div>
            </div>
            @if (visor(); as v) {
              <p style="font-size: 0.7rem; color: #64748b; margin: 0; padding: 4px 16px">Si la vista previa no carga, usa «Abrir en pestaña nueva».</p>
              <iframe [src]="v" style="flex: 1; border: 0; width: 100%; border-radius: 0 0 14px 14px" [title]="datos()?.nombreArchivo ?? 'Calendario académico'"></iframe>
            } @else {
              <div class="ac-vacio" style="flex: 1">
                
                Aún no se publicó el calendario académico de este periodo.
                <p style="font-size: 0.75rem; margin-top: 6px">Lo publica la coordinación en Planificación › Periodos y calendario › Calendarios (URL del documento oficial).</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class CalendarioActividades {
  private readonly api = inject(AcademicoApi);
  private readonly mis = inject(MisGrupos);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);

  // En /academico/docente/actividades: solo lo publicado y las evaluaciones de sus grupos
  readonly esDocente = this.route.snapshot.pathFromRoot.some((r) => r.routeConfig?.path === 'docente');

  readonly periodos = signal<Fila[]>([]);
  readonly idPeriodo = signal<number | null>(null);
  readonly datos = signal<Respuesta | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly verDocumento = signal(false);
  readonly comoAlumno = signal(false);
  readonly irA = signal<string | null>(null);
  private idsGrupo: number[] = [];

  readonly eventos = computed<EventoCal[]>(() =>
    (this.datos()?.actividades ?? []).map((a, i) => ({
      id: `${a.origen}-${a.idOrigen ?? i}`,
      clave: a.tipo,
      inicio: a.fechaInicio,
      fin: a.fechaFin,
      titulo: a.titulo || a.tipo,
      detalle: `${a.tipo} · ${a.area}${a.alcance ? ' · ' + a.alcance : ''}${a.descripcion ? '\n' + a.descripcion : ''}`,
      color: this.color(a.tipo),
      todoElDia: true,
    })),
  );

  readonly tiposPresentes = computed(() => [...new Set((this.datos()?.actividades ?? []).map((a) => a.tipo))]);

  readonly visor = computed<SafeResourceUrl | null>(() => {
    const url = this.datos()?.urlDocumento;
    if (!url) {
      return null;
    }
    // Google Drive: /view -> /preview; lo demas con Google Docs Viewer (como el LAMB)
    let embebida = url;
    if (url.includes('drive.google.com')) {
      embebida = url.replace(/\/view(\?.*)?$/, '/preview');
    } else {
      // Muchos sitios prohiben iframes (X-Frame-Options): el visor de Google si se puede embeber
      embebida = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embebida);
  });

  constructor() {
    forkJoin({
      periodos: this.api.listar('planificacion', '/api/v1/periodos-academicos'),
      grupos: this.esDocente ? this.api.listar('planificacion', '/api/v1/vistas/mis-grupos') : of([] as Fila[]),
    }).subscribe({
      next: ({ periodos, grupos }) => {
        this.idsGrupo = grupos.map((g) => Number(g['id']));
        this.periodos.set(periodos);
        const actual = periodos.find((p) => p['codigo'] === this.api.periodo()) ?? periodos.find((p) => p['estado'] === 'EN_CURSO') ?? periodos[0];
        if (actual) {
          this.elegirPeriodo(String(actual['id']));
        } else {
          this.cargando.set(false);
        }
      },
      error: (e) => {
        this.error.set(textoError(e));
        this.cargando.set(false);
      },
    });
  }

  /** Si cambia el periodo del Contexto de trabajo, el calendario lo sigue. */
  private readonly sigueContexto = effect(() => {
    const codigo = this.api.periodo();
    const lista = this.periodos();
    untracked(() => {
      const p = lista.find((x) => x['codigo'] === codigo);
      if (!this.esDocente && p && Number(p['id']) !== this.idPeriodo()) {
        this.elegirPeriodo(String(p['id']));
      }
    });
  });

  elegirPeriodo(v: string): void {
    this.idPeriodo.set(Number(v));
    const p = this.periodos().find((x) => Number(x['id']) === Number(v));
    if (p?.['fechaInicio']) {
      this.irA.set(String(p['fechaInicio']));
    }
    this.cargar();
  }

  cargar(): void {
    const id = this.idPeriodo();
    if (!id) {
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);
    of(null)
      .pipe(
        switchMap(() =>
          this.api.get<Respuesta>('planificacion', '/api/v1/vistas/actividades', {
            idPeriodo: id,
            idPrograma: this.api.programa(),
            idsGrupo: this.idsGrupo.join(','),
            soloAlumno: this.esDocente || this.comoAlumno(),
          }),
        ),
      )
      .subscribe({
        next: (r) => {
          this.datos.set(r);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(textoError(e));
          this.cargando.set(false);
        },
      });
  }

  etiquetaPeriodo(p: Fila): string {
    const tipo = (p['tipoPeriodo'] as Fila | undefined)?.['nombre'] ?? p['nombreTipoPeriodo'] ?? p['tipo'] ?? 'Regular';
    return `${tipo} ${p['codigo']}`;
  }

  color(tipo: string): string {
    return COLOR_TIPO[tipo] ?? '#475569';
  }
}
