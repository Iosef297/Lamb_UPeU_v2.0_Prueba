import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { TablaRecurso } from '../comun/tabla-recurso';
import { ModuloAcademico, RecursoMenu, SeccionMenu, buscarModulo } from '../modulos';

/** Seccion del menu: cabecera + chips por recurso + tabla CRUD del recurso elegido. */
@Component({
  selector: 'ac-seccion',
  imports: [TablaRecurso],
  template: `
    @if (seccion(); as s) {
      <div class="ac-page">
        <div class="ac-head">
          <div>
            <h2>{{ s.etiqueta }}</h2>
            <p class="sub">{{ s.descripcion }}</p>
          </div>
        </div>

        @if (s.recursos.length > 1) {
          <div class="ac-chips">
            @for (r of s.recursos; track r.ruta) {
              <button type="button" class="ac-chip" [class.on]="r.ruta === activo()?.ruta" (click)="elegir(r)">{{ r.etiqueta }}</button>
            }
          </div>
        }

        @if (activo(); as a) {
          <ac-tabla-recurso [modulo]="modulo()!.clave" [ruta]="a.ruta" [etiqueta]="a.etiqueta" />
        }
      </div>
    } @else {
      <div class="ac-page"><div class="ac-vacio">Sección no encontrada.</div></div>
    }
  `,
})
export class Seccion {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly modulo = signal<ModuloAcademico | null>(null);
  readonly seccion = signal<SeccionMenu | null>(null);
  readonly activo = signal<RecursoMenu | null>(null);

  constructor() {
    combineLatest([this.route.parent!.paramMap, this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(([pp, p, q]) => {
        const m = buscarModulo(pp.get('modulo')) ?? null;
        const s = m?.secciones.find((x) => x.clave === p.get('seccion')) ?? null;
        this.modulo.set(m);
        this.seccion.set(s);
        const pedido = q.get('r');
        this.activo.set(s?.recursos.find((r) => r.ruta.endsWith('/' + pedido)) ?? s?.recursos[0] ?? null);
      });
  }

  elegir(r: RecursoMenu): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { r: r.ruta.split('/').pop() } });
  }
}
