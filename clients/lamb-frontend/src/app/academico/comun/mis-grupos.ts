import { Injectable, computed, inject } from '@angular/core';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { AcademicoApi } from '../academico-api';
import { SesionUi } from './sesion-ui';

/** Un grupo del docente con su acta y lo que puede hacer (GET evaluacion /vistas/mis-actas). */
export interface MiActa {
  idGrupo: number;
  rol: string;
  gestionaNota: boolean;
  gestionaAsistencia: boolean;
  idActa: number | null;
  codigoCurso: string | null;
  periodo: string | null;
  estado: string | null;
  modoEvaluacion: string | null;
  notasHabilitadas: boolean | null;
  asistenciaHabilitada: boolean | null;
  puedeRegistrarNotas: boolean;
  puedeRegistrarAsistencia: boolean;
}

/**
 * Vista docente: el usuario con rol DOCENTE (sin ADMIN ni COORDINADOR) solo ve sus grupos
 * y solo escribe donde su asignacion lo permite (gestiona_nota / gestiona_asistencia).
 */
@Injectable({ providedIn: 'root' })
export class MisGrupos {
  private readonly api = inject(AcademicoApi);
  private readonly sesion = inject(SesionUi);
  private cache: Observable<MiActa[]> | null = null;

  readonly soloDocente = computed(
    () => this.sesion.auth.tieneRol('DOCENTE') && !this.sesion.auth.tieneRol('ADMIN', 'COORDINADOR'),
  );

  misActas(): Observable<MiActa[]> {
    if (!this.cache) {
      this.cache = this.api.get<MiActa[]>('evaluacion', '/api/v1/vistas/mis-actas').pipe(
        catchError(() => of([] as MiActa[])),
        shareReplay(1),
      );
    }
    return this.cache;
  }

  recargar(): void {
    this.cache = null;
  }
}
