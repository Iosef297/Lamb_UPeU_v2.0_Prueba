import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AcademicoApi, Fila, etiquetaFila } from '../academico-api';
import { Icono } from '../comun/icono';
import { SesionUi } from '../comun/sesion-ui';
import { MODULOS } from '../modulos';
import { CalendarioMes, EventoDia } from '../comun/calendario-mes';
import { SinGuion } from '../../core/sin-guion.pipe';

interface Tile {
  icono: string;
  etiqueta: string;
  ruta: string | null;
}

/** Pantalla de inicio del diseño: fondo de campus, barra superior y tiles de acceso. */
@Component({
  selector: 'ac-portal',
  imports: [SinGuion, Icono, RouterLink, CalendarioMes],
  templateUrl: './portal.html',
})
export class Portal {
  readonly sesion = inject(SesionUi);
  private readonly api = inject(AcademicoApi);
  private readonly router = inject(Router);

  readonly menuUsuario = signal(false);
  readonly verCalendario = signal(false);
  readonly eventos = signal<EventoDia[]>([]);
  private eventosCargados = false;

  // El DOCENTE (sin ADMIN ni COORDINADOR) solo ve su docencia; quien tambien es docente ve ambas
  readonly tiles = computed<Tile[]>(() => {
    const auth = this.sesion.auth;
    const docente: Tile = { icono: 'usuario', etiqueta: 'MI\nDOCENCIA', ruta: '/academico/docente' };
    const sistema: Tile = { icono: 'usuario', etiqueta: 'SISTEMA\nLAMB UPeU', ruta: '/' };
    if (auth.tieneRol('DOCENTE') && !auth.tieneRol('ADMIN', 'COORDINADOR')) {
      return [docente, sistema];
    }
    const modulos = MODULOS.map((m) => ({ icono: m.icono, etiqueta: m.titulo, ruta: `/academico/${m.clave}` }));
    return auth.tieneRol('DOCENTE') ? [...modulos, docente, sistema] : [...modulos, sistema];
  });

  readonly fondo = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&h=900&fit=crop&auto=format';
  readonly fondoVisible = signal(true);

  readonly saludo = computed(() => (this.sesion.auth.autenticado() ? this.sesion.nombre() : 'BIENVENIDO'));

  abrir(t: Tile): void {
    if (t.ruta) {
      this.router.navigateByUrl(t.ruta);
    }
  }

  alternarCalendario(): void {
    this.verCalendario.update((v) => !v);
    if (this.verCalendario() && !this.eventosCargados && this.sesion.auth.autenticado()) {
      this.eventosCargados = true;
      forkJoin({
        hitos: this.api.listar('planificacion', '/api/v1/hitos-calendario'),
        dias: this.api.listar('planificacion', '/api/v1/dias-no-lectivos'),
        periodos: this.api.listar('planificacion', '/api/v1/periodos-academicos'),
      }).subscribe({
        next: ({ hitos, dias, periodos }) => {
          const evts: EventoDia[] = [];
          const fecha = (f: Fila) => String(f['fecha'] ?? f['fechaInicio'] ?? '').slice(0, 10);
          hitos.forEach((h) => evts.push({ fecha: fecha(h), texto: `${etiquetaFila(h)}`, color: '#3B82F6' }));
          dias.forEach((d) => evts.push({ fecha: fecha(d), texto: `${etiquetaFila(d)}`, color: '#EF4444' }));
          periodos.forEach((p) => {
            evts.push({ fecha: String(p['fechaInicio'] ?? '').slice(0, 10), texto: `Inicio ${p['codigo']}`, color: '#10B981' });
            evts.push({ fecha: String(p['fechaFin'] ?? '').slice(0, 10), texto: `Fin ${p['codigo']}`, color: '#F97316' });
          });
          this.eventos.set(evts.filter((e) => e.fecha.length === 10));
        },
        error: () => this.eventos.set([]),
      });
    }
  }

  iniciarSesion(): void {
    this.sesion.auth.iniciarLogin('/academico');
  }

  cerrarSesion(): void {
    this.sesion.auth.cerrarSesion();
  }
}
