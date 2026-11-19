import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AcademicoApi, Fila } from '../academico-api';
import { SesionUi } from '../comun/sesion-ui';
import { MisGrupos } from '../comun/mis-grupos';
import { SinGuion } from '../../core/sin-guion.pipe';

interface Enlace {
  ruta: string;
  icono: string;
  etiqueta: string;
}

/** Layout de la vista docente: mismo diseño del portal, menu propio y solo sus grupos. */
@Component({
  selector: 'ac-docente-shell',
  imports: [SinGuion, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="ac-root">
      <div class="ac-shell">
        <aside class="ac-sidebar" [class.cerrado]="!sidebarAbierto()">
          <a class="ac-side-brand" routerLink="/academico" style="text-decoration: none" title="Volver al portal">
            <div class="ac-brand-box">A</div>
            <div class="ac-brand-text"><span class="a">A</span><span class="sep">|</span><span class="u">UPeU</span></div>
          </a>
          <div class="ac-side-modulo">MI DOCENCIA</div>
          <nav class="ac-nav">
            @for (e of enlaces; track e.ruta) {
              <a [routerLink]="['/academico/docente', e.ruta]" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: e.ruta === '' }">
                <span class="txt">{{ e.etiqueta }}</span>
              </a>
            }
            @if (!mis.soloDocente()) {
              <div class="ac-side-modulo" style="padding-left: 8px; margin-top: 12px">GESTIÓN</div>
              <a routerLink="/academico"><span class="txt">Portal académico</span></a>
            }
          </nav>
          <div class="ac-side-user">
            <div class="ac-avatar-y" style="cursor: default">{{ sesion.iniciales() }}</div>
            <div style="min-width: 0">
              <p class="n">{{ sesion.nombre() }}</p>
              <p class="r">{{ sesion.rol() | sinGuion }}</p>
            </div>
          </div>
        </aside>

        <div class="ac-main">
          <header class="ac-topbar">
            <div class="izq">
              <button type="button" class="ac-icon-btn" title="Mostrar u ocultar menú" (click)="sidebarAbierto.set(!sidebarAbierto())">☰</button>
              <div style="min-width: 0">
                <h1>Mi docencia</h1>
                <p class="sub">Vista docente · solo tus grupos asignados · Lamb UPeU 2.0</p>
              </div>
            </div>
            <div class="der">
              <select class="ac-select-chip" title="Periodo académico" (change)="api.elegirPeriodo($any($event.target).value)">
                <option value="" [selected]="!api.periodo()">Todos los periodos</option>
                @for (p of periodos(); track p['id']) {
                  <option [value]="p['codigo']" [selected]="p['codigo'] === api.periodo()">{{ p['nombreTipoPeriodo'] ? p['nombreTipoPeriodo'] + ' ' : '' }}{{ p['codigo'] }}</option>
                }
              </select>
              <button type="button" class="ac-avatar-n" [title]="'Cerrar sesión de ' + sesion.nombre()" (click)="sesion.auth.cerrarSesion()">
                {{ sesion.iniciales() }}
              </button>
            </div>
          </header>
          <div class="ac-content">
            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DocenteShell {
  readonly sesion = inject(SesionUi);
  readonly api = inject(AcademicoApi);
  readonly mis = inject(MisGrupos);
  readonly sidebarAbierto = signal(true);
  readonly periodos = signal<Fila[]>([]);

  readonly enlaces: Enlace[] = [
    { ruta: '', icono: '', etiqueta: 'Mis cursos' },
    { ruta: 'horario', icono: '', etiqueta: 'Mi horario' },
    { ruta: 'actividades', icono: '', etiqueta: 'Mi calendario' },
    { ruta: 'registro-notas', icono: '', etiqueta: 'Registro de notas' },
    { ruta: 'control-asistencia', icono: '', etiqueta: 'Control de asistencia' },
  ];

  constructor() {
    // Siempre datos frescos al entrar (el coordinador pudo cambiar permisos)
    this.mis.recargar();
    this.api.listar('planificacion', '/api/v1/periodos-academicos').subscribe({
      next: (p) => this.periodos.set(p),
      error: () => this.periodos.set([]),
    });
  }
}
