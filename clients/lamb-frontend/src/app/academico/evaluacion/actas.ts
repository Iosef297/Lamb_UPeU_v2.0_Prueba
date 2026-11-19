import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AcademicoApi, Fila, insigniaEstado, textoCelda } from '../academico-api';
import { textoError } from '../comun/formulario-modal';
import { SesionUi } from '../comun/sesion-ui';

interface Acta {
  id: number;
  idGrupo: number;
  codigoCurso: string;
  periodo: string;
  idDocente: number | null;
  estado: string;
  motivo: string | null;
  creditos: number;
  fechaRegistro: string;
  fechaCierre: string | null;
  modoEvaluacion: 'COMPETENCIA' | 'PONDERADO';
}

interface Competencia {
  idPersona: number;
  es: number;
  ep: number;
  ecg: number | null;
  notaFinal: number;
  aprobado: boolean;
  formula: string;
}

interface NotaActa {
  idGrupo: number;
  idPersona: number;
  notaFinal: number;
  aprobado: boolean;
}

interface Detalle {
  acta: Acta;
  notas: NotaActa[];
  escala: string | null;
  estadistica: Fila | null;
  historial: Fila[];
  competencias: Competencia[];
}

const CERRAR_ROLES = ['ADMIN', 'COORDINADOR', 'DOCENTE'];

/** Actas por grupo: notas finales, estadistica, historial y cierre. */
@Component({
  selector: 'ac-actas',
  imports: [FormsModule],
  templateUrl: './actas.html',
})
export class Actas {
  readonly api = inject(AcademicoApi);
  private readonly sesion = inject(SesionUi);
  private readonly router = inject(Router);

  readonly actas = signal<Acta[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly busqueda = signal('');
  readonly soloPeriodo = signal(true);
  readonly detalle = signal<Detalle | null>(null);
  readonly cargandoDetalle = signal(false);
  readonly confirmarCierre = signal(false);
  // grupo -> programa (planificacion) y programa -> nombre (institucional)
  private readonly programaDeGrupo = signal<Map<number, number | null>>(new Map());
  private readonly nombresPrograma = signal<Map<string, string>>(new Map());

  readonly puedeCerrar = computed(() => this.sesion.puedeEscribir(CERRAR_ROLES));

  readonly visibles = computed(() => {
    const p = this.api.periodo();
    const q = this.busqueda().trim().toLowerCase();
    return this.actas().filter(
      (a) =>
        (!this.soloPeriodo() || !p || a.periodo === p) &&
        (!this.api.programa() || String(this.programaDeGrupo().get(a.idGrupo)) === this.api.programa()) &&
        (!q || `${a.id} ${a.codigoCurso} ${a.idGrupo} ${a.estado}`.toLowerCase().includes(q)),
    );
  });

  readonly resumen = computed(() => {
    const v = this.visibles();
    const n = (e: string) => v.filter((a) => a.estado === e).length;
    return [
      { etiqueta: 'Total', valor: v.length, icono: '', color: '#1E3A8A' },
      { etiqueta: 'Abiertas', valor: n('ABIERTA'), icono: '', color: '#16A34A' },
      { etiqueta: 'Cerradas', valor: n('CERRADA'), icono: '', color: '#1E3A8A' },
      { etiqueta: 'Rechazadas', valor: n('RECHAZADA'), icono: '', color: '#DC2626' },
    ];
  });

  constructor() {
    this.cargar();
    this.api.get<Fila[]>('planificacion', '/api/v1/grupos').pipe(catchError(() => of([] as Fila[]))).subscribe((g) =>
      this.programaDeGrupo.set(new Map(g.map((x) => [x['id'] as number, (x['idPrograma'] as number | null) ?? null]))),
    );
    this.api.nombresPrograma().subscribe((m) => this.nombresPrograma.set(m));
  }

  programa(idGrupo: number): string {
    const id = this.programaDeGrupo().get(idGrupo);
    if (id === null || id === undefined) {
      return '—';
    }
    return this.nombresPrograma().get(String(id)) ?? `Programa #${id}`;
  }

  cargar(): void {
    this.cargando.set(true);
    this.api.get<Acta[]>('evaluacion', '/api/v1/actas').subscribe({
      next: (a) => {
        this.actas.set([...a].sort((x, y) => y.id - x.id));
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(textoError(e));
      },
    });
  }

  abrir(acta: Acta): void {
    this.confirmarCierre.set(false);
    this.cargandoDetalle.set(true);
    this.detalle.set({ acta, notas: [], escala: null, estadistica: null, historial: [], competencias: [] });
    forkJoin({
      notas: this.api.get<{ notas: NotaActa[]; escala: string }>('evaluacion', `/api/v1/vistas/acta-notas/${acta.id}`).pipe(catchError(() => of(null))),
      estadistica: this.api.get<Fila>('evaluacion', `/api/v1/vistas/estadistica-grupo/${acta.idGrupo}`).pipe(catchError(() => of(null))),
      historial: this.api.get<Fila[]>('evaluacion', `/api/v1/vistas/historial-acta/${acta.id}`).pipe(catchError(() => of([]))),
      competencias: acta.modoEvaluacion === 'COMPETENCIA'
        ? this.api.get<Competencia[]>('evaluacion', `/api/v1/vistas/resumen-competencias/${acta.idGrupo}`).pipe(catchError(() => of([])))
        : of([] as Competencia[]),
    }).subscribe(({ notas, estadistica, historial, competencias }) => {
      this.detalle.set({
        acta,
        notas: notas?.notas ?? [],
        escala: notas?.escala ?? null,
        estadistica,
        historial: historial ?? [],
        competencias: competencias ?? [],
      });
      this.cargandoDetalle.set(false);
    });
  }

  cerrar(acta: Acta): void {
    this.confirmarCierre.set(false);
    this.api.post<Acta>('evaluacion', `/api/v1/actas/${acta.id}/cerrar`).subscribe({
      next: (a) => {
        this.aviso.set(`Acta #${acta.id} cerrada: notas finales calculadas y evento acta.cerrada enviado a trayectoria.`);
        setTimeout(() => this.aviso.set(null), 4500);
        this.cargar();
        this.abrir(a ?? acta);
      },
      error: (e) => this.error.set(textoError(e)),
    });
  }

  cambiarModo(acta: Acta, modo: 'COMPETENCIA' | 'PONDERADO'): void {
    this.api.put<Acta>('evaluacion', `/api/v1/actas/${acta.id}/modo?modo=${modo}`, {}).subscribe({
      next: (a) => {
        this.cargar();
        this.abrir(a);
      },
      error: (e) => this.error.set(textoError(e)),
    });
  }

  registrarNotas(acta: Acta): void {
    this.router.navigate(['/academico/evaluacion/s/notas'], { queryParams: { r: 'notas' } });
    void acta;
  }

  insignia(e: unknown) {
    return insigniaEstado(e);
  }

  texto(v: unknown): string {
    return textoCelda(v);
  }

  numero(v: unknown): string {
    return v === null || v === undefined ? '—' : Number(v).toFixed(2);
  }

  porcentaje(v: unknown): number {
    return Math.max(0, Math.min(100, Number(v) || 0));
  }
}
