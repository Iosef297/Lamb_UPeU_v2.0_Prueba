import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AcademicoApi, Fila } from '../academico-api';
import { textoError } from '../comun/formulario-modal';
import { MiActa, MisGrupos } from '../comun/mis-grupos';
import { SesionUi } from '../comun/sesion-ui';
import { SinGuion } from '../../core/sin-guion.pipe';

interface Curso {
  grupo: Fila;
  asignacion: Fila | null;
  acta: MiActa | null;
}

const COLOR_ESTADO: Record<string, string> = { ABIERTA: '#16A34A', CERRADA: '#64748B', RECHAZADA: '#DC2626' };

/** Inicio de la vista docente: tarjetas de sus grupos con rol, horario, acta y accesos directos. */
@Component({
  selector: 'ac-mis-cursos',
  imports: [SinGuion, RouterLink],
  templateUrl: './mis-cursos.html',
})
export class MisCursos {
  readonly api = inject(AcademicoApi);
  private readonly mis = inject(MisGrupos);
  private readonly sesion = inject(SesionUi);

  readonly cursos = signal<Curso[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly idPersona = this.sesion.auth.idPersona;
  // Mismo criterio que la vista admin: nombre del programa (institucional) en vez del id
  private readonly nombresPrograma = toSignal(this.api.nombresPrograma(), { initialValue: new Map<string, string>() });

  programa(c: Curso): string {
    const id = c.grupo['idPrograma'];
    return id === null || id === undefined ? 'Sin programa' : (this.nombresPrograma().get(String(id)) ?? `Programa #${id}`);
  }

  readonly visibles = computed(() => {
    const p = this.api.periodo();
    return this.cursos().filter((c) => !p || c.grupo['periodo'] === p);
  });
  readonly horas = computed(() => this.visibles().reduce((s, c) => s + Number(c.asignacion?.['horasSemanales'] ?? 0), 0));
  readonly conNotas = computed(() => this.visibles().filter((c) => c.acta?.puedeRegistrarNotas).length);

  constructor() {
    forkJoin({
      grupos: this.api.listar('planificacion', '/api/v1/vistas/mis-grupos').pipe(
        catchError((e) => {
          this.error.set(textoError(e));
          return of([] as Fila[]);
        }),
      ),
      actas: this.mis.misActas(),
    }).subscribe(({ grupos, actas }) => {
      const yo = Number(this.idPersona());
      this.cursos.set(
        grupos.map((g) => ({
          grupo: g,
          asignacion: ((g['docentes'] as Fila[]) ?? []).find((d) => Number(d['idDocente']) === yo) ?? null,
          acta: actas.find((a) => a.idGrupo === Number(g['id'])) ?? null,
        })),
      );
      this.cargando.set(false);
    });
  }

  curso(c: Curso): Fila {
    return (c.grupo['curso'] as Fila) ?? {};
  }

  color(estado: string): string {
    return COLOR_ESTADO[estado] ?? '#1E3A8A';
  }
}
