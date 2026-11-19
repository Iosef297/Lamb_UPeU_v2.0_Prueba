import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AcademicoApi, Fila, Opcion } from '../academico-api';
import { SesionUi } from '../comun/sesion-ui';
import { MODULOS, REF_PROGRAMA, SeccionMenu, buscarModulo } from '../modulos';
import { SinGuion } from '../../core/sin-guion.pipe';

/** Layout del diseño: sidebar navy con degradado + barra superior blanca. */
@Component({
  selector: 'ac-shell',
  imports: [SinGuion, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell {
  readonly sesion = inject(SesionUi);
  readonly api = inject(AcademicoApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly sidebarAbierto = signal(true);
  readonly modulos = MODULOS;
  readonly periodos = signal<Fila[]>([]);
  readonly programas = signal<Opcion[]>([]);
  private readonly ofertas = signal<Fila[]>([]);

  private static readonly ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  /** "Regular 2026-2 (Ciclos I, III, V)": ciclos que el programa elegido ofrece en ese periodo. */
  etiquetaPeriodo(p: Fila): string {
    const base = `${p['nombreTipoPeriodo'] ? p['nombreTipoPeriodo'] + ' ' : ''}${p['codigo']}`;
    const prog = this.api.programa();
    if (!prog) return base;
    const ciclos = [
      ...new Set(
        this.ofertas()
          .filter((o) => String(o['idPrograma']) === prog && String(o['codigoPeriodo'] ?? o['periodo']) === String(p['codigo']))
          .map((o) => Number(o['ciclo']))
          .filter((c) => c > 0),
      ),
    ].sort((a, b) => a - b);
    if (ciclos.length === 0) return base;
    const rom = ciclos.map((c) => Shell.ROMANOS[c] ?? String(c));
    return `${base} (Ciclo${rom.length > 1 ? 's' : ''} ${rom.join(', ')})`;
  }

  private readonly clave = toSignal(this.route.paramMap.pipe(map((p) => p.get('modulo'))), {
    initialValue: this.route.snapshot.paramMap.get('modulo'),
  });
  readonly modulo = computed(() => buscarModulo(this.clave()));

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Pagina de inicio del modulo (sin seccion): no pide contexto de trabajo. */
  readonly enInicio = computed(() => this.url().split(/[?#]/)[0].replace(/\/$/, '') === `/academico/${this.modulo()?.clave}`);

  // Seccion activa para el subtitulo de la barra superior
  readonly seccionActiva = computed(() => {
    const m = this.modulo();
    const url = this.url();
    return m?.secciones.find((s) => url.includes(`/${s.pagina ?? 's/' + s.clave}`)) ?? null;
  });

  constructor() {
    // El curriculo no trabaja por semestre: ahi solo se elige el programa
    effect(() => this.api.requierePeriodo.set(this.modulo()?.clave !== 'curriculo'));
    this.api.listar('planificacion', '/api/v1/ofertas-academicas').subscribe({
      next: (o) => this.ofertas.set(o),
      error: () => this.ofertas.set([]),
    });
    this.api.listar('planificacion', '/api/v1/periodos-academicos').subscribe({
      next: (p) => {
        this.periodos.set(p);
        // Si el periodo recordado ya no existe, se vuelve a pedir
        if (this.api.periodo() && !p.some((x) => x['codigo'] === this.api.periodo())) {
          this.api.elegirPeriodo('');
        }
      },
      error: () => this.periodos.set([]),
    });
    // Programas de institucional; si ese microservicio no responde queda "Todos los programas"
    this.api.opciones(REF_PROGRAMA).subscribe((p) => {
      if (p.length > 0) {
        this.programas.set(p);
        return;
      }
      // Respaldo sin institucional: los programas que ya tienen plan de estudios (solo el id)
      this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe({
        next: (planes) => {
          const ids = [...new Set(planes.map((x) => Number(x['idPrograma'])))].sort((a, b) => a - b);
          this.programas.set(ids.map((id) => ({ valor: id, etiqueta: `Programa #${id} (sin institucional)` })));
        },
        error: () => this.programas.set([]),
      });
    });
  }

  enlace(s: SeccionMenu): string[] {
    const base = `/academico/${this.modulo()?.clave}`;
    return s.pagina ? [base, s.pagina] : [base, 's', s.clave];
  }

  cambiarPeriodo(valor: string): void {
    this.api.elegirPeriodo(valor);
  }

  cambiarPrograma(valor: string): void {
    this.api.elegirPrograma(valor);
  }
}
