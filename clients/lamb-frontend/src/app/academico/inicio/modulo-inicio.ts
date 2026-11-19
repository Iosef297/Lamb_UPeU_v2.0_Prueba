import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AcademicoApi, Fila } from '../academico-api';
import { SesionUi } from '../comun/sesion-ui';
import { ClaveModulo, ModuloAcademico, SeccionMenu, buscarModulo } from '../modulos';
import { SinGuion } from '../../core/sin-guion.pipe';

interface Indicador {
  etiqueta: string;
  icono: string;
  color: string;
  ruta: string;
  cuenta: (filas: Fila[]) => number;
  valor?: number | null;
}

const total = (f: Fila[]) => f.length;
const conEstado =
  (...estados: string[]) =>
  (f: Fila[]) =>
    f.filter((x) => estados.includes(String(x['estado']))).length;

const INDICADORES: Record<ClaveModulo, Indicador[]> = {
  curriculo: [
    { etiqueta: 'Planes vigentes', icono: '', color: '#16A34A', ruta: '/api/v1/planes-estudio', cuenta: conEstado('VIGENTE') },
    { etiqueta: 'Cursos en catálogo', icono: '', color: '#1E3A8A', ruta: '/api/v1/cursos-catalogo', cuenta: total },
    { etiqueta: 'Perfiles de egreso', icono: '', color: '#7C3AED', ruta: '/api/v1/perfiles-egreso', cuenta: total },
    { etiqueta: 'Solicitudes pendientes', icono: '', color: '#B45309', ruta: '/api/v1/solicitudes-modificacion-curricular', cuenta: conEstado('PENDIENTE', 'EN_REVISION') },
  ],
  planificacion: [
    { etiqueta: 'Grupos abiertos', icono: '', color: '#16A34A', ruta: '/api/v1/grupos', cuenta: conEstado('ABIERTO') },
    { etiqueta: 'Oferta académica', icono: '', color: '#1E3A8A', ruta: '/api/v1/ofertas-academicas', cuenta: total },
    { etiqueta: 'Ambientes', icono: '', color: '#EA580C', ruta: '/api/v1/ambientes', cuenta: total },
    { etiqueta: 'Aperturas pendientes', icono: '', color: '#B45309', ruta: '/api/v1/solicitudes-apertura-grupo', cuenta: conEstado('PENDIENTE') },
  ],
  evaluacion: [
    { etiqueta: 'Actas abiertas', icono: '', color: '#16A34A', ruta: '/api/v1/actas', cuenta: conEstado('ABIERTA') },
    { etiqueta: 'Actas cerradas', icono: '', color: '#1E3A8A', ruta: '/api/v1/actas', cuenta: conEstado('CERRADA') },
    { etiqueta: 'Notas registradas', icono: '', color: '#7C3AED', ruta: '/api/v1/notas', cuenta: total },
    { etiqueta: 'Notas rezagadas', icono: '', color: '#B45309', ruta: '/api/v1/solicitudes-apertura-notas', cuenta: conEstado('PENDIENTE') },
  ],
};

interface Alerta {
  ms: ClaveModulo;
  ruta: string;
  cuenta: (filas: Fila[]) => number;
  texto: (n: number) => string;
  ir: string;
  nivel: 'rojo' | 'amarillo';
}

const sinTitular = (g: Fila[]) =>
  g.filter((x) => x['estado'] !== 'ANULADO' && !((x['docentes'] as Fila[]) ?? []).some((d) => d['rol'] === 'TITULAR')).length;

// Alertas del dashboard (guia §8.4): lo que el admin debe atender hoy
const ALERTAS: Record<ClaveModulo, Alerta[]> = {
  curriculo: [
    { ms: 'curriculo', ruta: '/api/v1/planes-estudio', cuenta: conEstado('BORRADOR'), texto: (n) => `${n} plan(es) en BORRADOR sin publicar`, ir: 'plan-estudios', nivel: 'amarillo' },
    { ms: 'curriculo', ruta: '/api/v1/solicitudes-modificacion-curricular', cuenta: conEstado('PENDIENTE'), texto: (n) => `${n} solicitud(es) de modificación por responder`, ir: 'bandeja', nivel: 'amarillo' },
  ],
  planificacion: [
    { ms: 'planificacion', ruta: '/api/v1/grupos', cuenta: conEstado('PENDIENTE_VALIDACION'), texto: (n) => `${n} grupo(s) pendientes de validación: currículo no respondió, usa Revalidar`, ir: 'grupos', nivel: 'rojo' },
    { ms: 'planificacion', ruta: '/api/v1/grupos', cuenta: sinTitular, texto: (n) => `${n} grupo(s) sin docente TITULAR (su acta será rechazada)`, ir: 'grupos', nivel: 'rojo' },
    { ms: 'planificacion', ruta: '/api/v1/grupos', cuenta: conEstado('ANULADO'), texto: (n) => `${n} grupo(s) ANULADO`, ir: 'grupos', nivel: 'amarillo' },
    { ms: 'planificacion', ruta: '/api/v1/solicitudes-cambio-aula', cuenta: conEstado('PENDIENTE'), texto: (n) => `${n} cambio(s) de aula por responder`, ir: 'bandeja', nivel: 'amarillo' },
    { ms: 'planificacion', ruta: '/api/v1/solicitudes-cambio-horario', cuenta: conEstado('PENDIENTE'), texto: (n) => `${n} cambio(s) de horario por responder`, ir: 'bandeja', nivel: 'amarillo' },
  ],
  evaluacion: [
    { ms: 'evaluacion', ruta: '/api/v1/actas', cuenta: conEstado('RECHAZADA'), texto: (n) => `${n} acta(s) RECHAZADA (grupo sin docente titular)`, ir: 'actas', nivel: 'rojo' },
    { ms: 'evaluacion', ruta: '/api/v1/actas', cuenta: conEstado('ABIERTA'), texto: (n) => `${n} acta(s) ABIERTA por cerrar`, ir: 'actas', nivel: 'amarillo' },
    { ms: 'evaluacion', ruta: '/api/v1/actas-rectificacion', cuenta: conEstado('PENDIENTE'), texto: (n) => `${n} rectificación(es) de acta por responder`, ir: 'bandeja', nivel: 'amarillo' },
    { ms: 'evaluacion', ruta: '/api/v1/justificaciones-inasistencia', cuenta: conEstado('PENDIENTE'), texto: (n) => `${n} justificación(es) de inasistencia por responder`, ir: 'bandeja', nivel: 'amarillo' },
  ],
};

/** Inicio de un modulo: indicadores, alertas, proximos hitos y accesos a cada seccion. */
@Component({
  imports: [SinGuion],
  selector: 'ac-modulo-inicio',
  template: `
    @if (modulo(); as m) {
      <div class="ac-page">
        <div class="ac-head">
          <div>
            <h2>{{ m.nombre }}</h2>
            <p class="sub">{{ m.descripcion }}</p>
          </div>
          <div class="acciones">
            <span class="ac-badge" style="background: #eff6ff; color: #1e3a8a">Periodo {{ api.periodo() || '—' }}</span>
            <span class="ac-badge" [style.background]="escribe() ? '#dcfce7' : '#fef3c7'" [style.color]="escribe() ? '#16a34a' : '#b45309'">
              {{ escribe() ? 'Puedes registrar y editar' : 'Solo lectura para tu rol' }}
            </span>
          </div>
        </div>

        <div class="ac-stats">
          @for (i of indicadores(); track i.etiqueta) {
            <div class="ac-stat">
              <div>
                <p class="val" [style.color]="i.color">{{ i.valor ?? '…' }}</p>
                <p class="lbl">{{ i.etiqueta }}</p>
              </div>
            </div>
          }
        </div>

        <div class="ac-grid-2" style="margin-bottom: 20px">
          <div class="ac-card" style="margin-top: 0">
            <div class="ac-card-head"><h3>Atender hoy</h3><span style="font-size: 0.75rem; color: #94a3b8">{{ alertas().length }} alerta(s)</span></div>
            @if (alertas().length === 0) {
              <div class="ac-vacio" style="padding: 24px">Todo en orden.</div>
            } @else {
              <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px">
                @for (a of alertas(); track a.texto) {
                  <button type="button" class="ac-alerta" [class.error]="a.nivel === 'rojo'" [class.aviso]="a.nivel !== 'rojo'" style="margin: 0; text-align: left; width: 100%; cursor: pointer" (click)="irA(m, a.ir)">
                    {{ a.texto }} <span style="margin-left: auto">→</span>
                  </button>
                }
              </div>
            }
          </div>
          <div class="ac-card" style="margin-top: 0">
            <div class="ac-card-head"><h3>Próximos hitos del calendario</h3></div>
            @if (hitos().length === 0) {
              <div class="ac-vacio" style="padding: 24px">Sin hitos próximos registrados.</div>
            } @else {
              <table class="ac-table compacta">
                <tbody>
                  @for (h of hitos(); track h['id']) {
                    <tr><td class="cod">{{ h['fechaInicio'] }}</td><td class="fuerte">{{ h['nombre'] }}</td><td>{{ h['tipo'] | sinGuion }}</td></tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>

        <div class="ac-card" style="margin-bottom: 20px">
          <div class="ac-card-head"><h3>Accesos del módulo</h3><span style="font-size: 0.75rem; color: #94a3b8">{{ m.secciones.length }} secciones</span></div>
          <div class="ac-card-body">
            <div class="ac-grid-3">
              @for (s of m.secciones; track s.clave) {
                <button type="button" class="ac-acceso" (click)="ir(m, s)">
                  <div>
                    <p class="t">{{ s.etiqueta }}</p>
                    <p class="d">{{ s.descripcion }}</p>
                    <p class="c">{{ s.pagina ? 'Vista principal →' : s.recursos.length + ' recurso(s) →' }}</p>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModuloInicio {
  readonly api = inject(AcademicoApi);
  private readonly sesion = inject(SesionUi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly modulo = signal<ModuloAcademico | null>(null);
  readonly indicadores = signal<Indicador[]>([]);
  readonly escribe = signal(false);
  readonly alertas = signal<{ texto: string; ir: string; nivel: string }[]>([]);
  readonly hitos = signal<Fila[]>([]);

  constructor() {
    this.route.parent!.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((p) => {
      const m = buscarModulo(p.get('modulo')) ?? null;
      this.modulo.set(m);
      if (m) {
        this.escribe.set(this.sesion.puedeEscribir(m.rolesEscritura));
        this.cargar(m);
      }
    });
  }

  private cargarAlertas(m: ModuloAcademico): void {
    const lista = ALERTAS[m.clave];
    const rutas = [...new Set(lista.map((a) => a.ruta))];
    forkJoin(rutas.map((r) => this.api.listar(m.clave, r).pipe(catchError(() => of([] as Fila[]))))).subscribe((res) => {
      const porRuta = new Map(rutas.map((r, i) => [r, res[i]]));
      this.alertas.set(
        lista
          .map((a) => ({ n: a.cuenta(porRuta.get(a.ruta) ?? []), a }))
          .filter((x) => x.n > 0)
          .map((x) => ({ texto: x.a.texto(x.n), ir: x.a.ir, nivel: x.a.nivel })),
      );
    });
    const hoy = new Date().toISOString().slice(0, 10);
    this.api
      .listar('planificacion', '/api/v1/hitos-calendario')
      .pipe(catchError(() => of([] as Fila[])))
      .subscribe((h) =>
        this.hitos.set(
          h
            .filter((x) => String(x['fechaFin'] ?? x['fechaInicio'] ?? '') >= hoy)
            .sort((a, b) => String(a['fechaInicio']).localeCompare(String(b['fechaInicio'])))
            .slice(0, 5),
        ),
      );
  }

  irA(m: ModuloAcademico, pagina: string): void {
    const s = m.secciones.find((x) => x.pagina === pagina);
    this.router.navigate(['/academico', m.clave, pagina]);
    void s;
  }

  private cargar(m: ModuloAcademico): void {
    this.cargarAlertas(m);
    const lista = INDICADORES[m.clave].map((i) => ({ ...i, valor: null }));
    this.indicadores.set(lista);
    const rutas = [...new Set(lista.map((i) => i.ruta))];
    forkJoin(rutas.map((r) => this.api.listar(m.clave, r).pipe(catchError(() => of(null))))).pipe(
      map((res) => new Map(rutas.map((r, i) => [r, res[i]]))),
    ).subscribe((porRuta) => {
      this.indicadores.set(lista.map((i) => ({ ...i, valor: porRuta.get(i.ruta) ? i.cuenta(porRuta.get(i.ruta)!) : null })));
    });
  }

  ir(m: ModuloAcademico, s: SeccionMenu): void {
    this.router.navigate(s.pagina ? ['/academico', m.clave, s.pagina] : ['/academico', m.clave, 's', s.clave]);
  }
}
