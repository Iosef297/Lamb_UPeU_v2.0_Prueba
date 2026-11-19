import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { AcademicoApi, Fila } from '../academico-api';
import { REF_PERSONA } from '../modulos';

export interface Estudiante {
  idPersona: number;
  nombre: string;
  // De donde salio: matricula confirmada, solo tiene notas/asistencia, o agregado a mano
  origen: 'MATRICULA' | 'REGISTROS' | 'MANUAL';
}

/**
 * Estudiantes de un grupo. Evaluacion no guarda la lista (ver guia §5.3): se arma con las matriculas
 * de lamb-matricula-ms (detalles[].idSeccion = grupo) mas quienes ya tienen notas o asistencia.
 * Si matricula no responde, quedan solo los que ya tienen registros.
 */
@Injectable({ providedIn: 'root' })
export class EstudiantesGrupo {
  private readonly api = inject(AcademicoApi);

  delGrupo(idGrupo: number, registros: Fila[]): Observable<Estudiante[]> {
    return forkJoin({
      matriculas: this.api.listar('matricula', '/api/v1/matriculas').pipe(catchError(() => of([] as Fila[]))),
      personas: this.api.opciones(REF_PERSONA),
    }).pipe(
      map(({ matriculas, personas }) => {
        const nombres = new Map(personas.map((p) => [Number(p.valor), p.etiqueta]));
        const lista = new Map<number, Estudiante>();
        for (const m of matriculas) {
          const enGrupo = ((m['detalles'] as Fila[]) ?? []).some((d) => Number(d['idSeccion']) === idGrupo);
          if (enGrupo && !String(m['estado'] ?? '').startsWith('ANULAD')) {
            const id = Number(m['idPersona']);
            lista.set(id, { idPersona: id, nombre: nombres.get(id) ?? `Persona #${id}`, origen: 'MATRICULA' });
          }
        }
        for (const r of registros) {
          const id = Number(r['idPersona']);
          if (!lista.has(id)) {
            lista.set(id, { idPersona: id, nombre: nombres.get(id) ?? `Persona #${id}`, origen: 'REGISTROS' });
          }
        }
        return [...lista.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
      }),
    );
  }
}
