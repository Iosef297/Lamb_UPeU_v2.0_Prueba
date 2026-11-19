import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { AcademicoApi, Fila, Opcion } from '../academico-api';
import { Estudiante, EstudiantesGrupo } from '../comun/estudiantes-grupo';
import { textoError } from '../comun/formulario-modal';
import { SesionUi } from '../comun/sesion-ui';
import { MiActa, MisGrupos } from '../comun/mis-grupos';
import { REF_PERSONA } from '../modulos';
import { SinGuion } from '../../core/sin-guion.pipe';

interface Acta {
  id: number;
  idGrupo: number;
  codigoCurso: string;
  periodo: string;
  estado: string;
  modoEvaluacion: 'COMPETENCIA' | 'PONDERADO';
}

/** Columna de la grilla: una evidencia programada o, si no hay, un componente. */
interface Columna {
  clave: string;
  titulo: string;
  sub: string;
  idComponente: number;
  idEvaluacionProgramada: number | null;
  bloque: 'ES' | 'EP' | 'ECG' | '';
}

interface Celda {
  valor: string;
  idNota: number | null;
  estado: 'limpia' | 'guardando' | 'ok' | 'error';
  error?: string;
}

interface Final {
  notaFinal: number;
  aprobado: boolean;
  es?: number;
  ep?: number;
  ecg?: number | null;
}

const COLORES: Record<string, string> = { ES: '#3B82F6', EP: '#F59E0B', ECG: '#10B981', '': '#64748B' };

/** Registro de notas en grilla (E3): filas = estudiantes, columnas = evidencias; guarda celda por celda. */
@Component({
  selector: 'ac-registro-notas',
  imports: [SinGuion, FormsModule],
  templateUrl: './registro-notas.html',
})
export class RegistroNotas {
  readonly api = inject(AcademicoApi);
  private readonly sesion = inject(SesionUi);
  private readonly estudiantesGrupo = inject(EstudiantesGrupo);
  private readonly route = inject(ActivatedRoute);
  readonly mis = inject(MisGrupos);
  readonly misActas = signal<MiActa[]>([]);
  readonly miPermiso = computed(() => this.misActas().find((m) => m.idGrupo === this.idGrupo()) ?? null);

  readonly actas = signal<Acta[]>([]);
  readonly idGrupo = signal<number | null>(null);
  readonly acta = signal<Acta | null>(null);
  readonly columnas = signal<Columna[]>([]);
  readonly estudiantes = signal<Estudiante[]>([]);
  readonly celdas = signal<Record<string, Celda>>({});
  readonly finales = signal<Map<number, Final>>(new Map());
  readonly escala = signal<Fila | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly personas = signal<Opcion[]>([]);
  nuevoEstudiante = '';

  readonly editable = computed(
    () =>
      this.acta()?.estado === 'ABIERTA' &&
      this.sesion.puedeEscribir(['ADMIN', 'DOCENTE']) &&
      (!this.mis.soloDocente() || !!this.miPermiso()?.puedeRegistrarNotas),
  );
  readonly min = computed(() => Number(this.escala()?.['notaMinima'] ?? 0));
  readonly max = computed(() => Number(this.escala()?.['notaMaxima'] ?? 20));
  readonly aprobatoria = computed(() => Number(this.escala()?.['notaAprobatoria'] ?? 10.5));
  readonly colores = COLORES;

  readonly actasDelContexto = computed(() => {
    const p = this.api.periodo();
    const mios = new Set(this.misActas().map((m) => m.idGrupo));
    return this.actas().filter(
      (a) => a.estado !== 'RECHAZADA' && (!p || a.periodo === p) && (!this.mis.soloDocente() || mios.has(a.idGrupo)),
    );
  });

  readonly resumen = computed(() => {
    const f = [...this.finales().values()];
    return {
      estudiantes: this.estudiantes().length,
      aprobados: f.filter((x) => x.aprobado).length,
      desaprobados: f.filter((x) => !x.aprobado).length,
      pendientes: Object.values(this.celdas()).filter((c) => c.valor === '').length,
    };
  });

  constructor() {
    this.api.get<Acta[]>('evaluacion', '/api/v1/actas').subscribe({
      next: (a) => {
        this.actas.set(a);
        const pedido = Number(this.route.snapshot.queryParamMap.get('grupo'));
        if (pedido) {
          this.elegir(String(pedido));
        }
      },
      error: (e) => this.error.set(textoError(e)),
    });
    if (this.mis.soloDocente()) {
      this.mis.misActas().subscribe((m) => this.misActas.set(m));
    }
    this.api.get<Fila[]>('evaluacion', '/api/v1/escalas-calificacion').subscribe((e) => this.escala.set(e.find((x) => x['vigente']) ?? null));
    this.api.opciones(REF_PERSONA).subscribe((p) => this.personas.set(p));
  }

  elegir(valor: string): void {
    const id = Number(valor) || null;
    this.idGrupo.set(id);
    this.acta.set(this.actas().find((a) => a.idGrupo === id) ?? null);
    if (id) {
      this.cargar(id);
    }
  }

  private cargar(idGrupo: number): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      evidencias: this.api.listar('evaluacion', '/api/v1/evaluaciones-programadas', { idGrupo }),
      componentes: this.api.listar('evaluacion', '/api/v1/componentes-evaluacion'),
      notas: this.api.listar('evaluacion', '/api/v1/notas', { idGrupo }),
    }).subscribe({
      next: ({ evidencias, componentes, notas }) => {
        this.columnas.set(this.armarColumnas(evidencias, componentes, notas));
        this.estudiantesGrupo.delGrupo(idGrupo, notas).subscribe((est) => {
          this.estudiantes.set(est);
          this.llenarCeldas(notas);
          this.cargando.set(false);
          this.recalcular();
        });
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(textoError(e));
      },
    });
  }

  private armarColumnas(evidencias: Fila[], componentes: Fila[], notas: Fila[]): Columna[] {
    const bloque = (tipo: unknown): Columna['bloque'] =>
      tipo === 'EVALUACION_SESIONES' ? 'ES' : tipo === 'EVALUACION_COMPETENCIA_GENERICA' ? 'ECG' : tipo ? 'EP' : '';
    if (evidencias.length) {
      return [...evidencias]
        .sort((a, b) => Number(a['orden'] ?? 99) - Number(b['orden'] ?? 99) || Number(a['id']) - Number(b['id']))
        .map((e) => ({
          clave: `e${e['id']}`,
          titulo: `${e['unidad'] ?? ''} ${e['codigoComponente']}`.trim(),
          sub: e['peso'] ? `${Number(e['peso'])} %` : String(e['descripcion'] ?? ''),
          idComponente: Number(e['idComponente']),
          idEvaluacionProgramada: Number(e['id']),
          bloque: bloque(e['tipoComponente']),
        }));
    }
    // Sin evidencias: una columna por componente (los del modo competencia, o los que ya tienen notas)
    const usados = new Set(notas.map((n) => Number(n['idComponente'])));
    const competencia = this.acta()?.modoEvaluacion === 'COMPETENCIA';
    return componentes
      .filter((c) => (competencia ? ['ES', 'EP', 'ECG'].includes(String(c['codigo'])) : true) || usados.has(Number(c['id'])))
      .map((c) => ({
        clave: `c${c['id']}`,
        titulo: String(c['codigo']),
        sub: String(c['nombre']),
        idComponente: Number(c['id']),
        idEvaluacionProgramada: null,
        bloque: bloque(c['tipo']),
      }));
  }

  private llenarCeldas(notas: Fila[]): void {
    const celdas: Record<string, Celda> = {};
    for (const est of this.estudiantes()) {
      for (const col of this.columnas()) {
        const nota = notas.find(
          (n) =>
            Number(n['idPersona']) === est.idPersona &&
            (col.idEvaluacionProgramada
              ? Number(n['idEvaluacionProgramada']) === col.idEvaluacionProgramada
              : Number(n['idComponente']) === col.idComponente && !n['idEvaluacionProgramada']),
        );
        celdas[`${est.idPersona}:${col.clave}`] = {
          valor: nota ? String(Number(nota['calificacion'])) : '',
          idNota: nota ? Number(nota['id']) : null,
          estado: 'limpia',
        };
      }
    }
    this.celdas.set(celdas);
  }

  celda(est: Estudiante, col: Columna): Celda {
    return this.celdas()[`${est.idPersona}:${col.clave}`] ?? { valor: '', idNota: null, estado: 'limpia' };
  }

  fueraDeEscala(valor: string): boolean {
    if (valor === '') {
      return false;
    }
    const n = Number(valor);
    return Number.isNaN(n) || n < this.min() || n > this.max();
  }

  /** Guarda una celda: crea la nota, la actualiza o la borra si se vacio. */
  guardar(est: Estudiante, col: Columna, valor: string): void {
    const clave = `${est.idPersona}:${col.clave}`;
    const actual = this.celdas()[clave];
    const acta = this.acta();
    if (!acta || !actual) {
      return;
    }
    valor = String(valor ?? '').trim();
    if (valor === actual.valor && actual.estado !== 'error') {
      return;
    }
    if (this.fueraDeEscala(valor)) {
      this.poner(clave, { ...actual, valor, estado: 'error', error: `Debe estar entre ${this.min()} y ${this.max()}` });
      return;
    }
    const cuerpo = {
      idPersona: est.idPersona,
      idGrupo: acta.idGrupo,
      idComponente: col.idComponente,
      idEvaluacionProgramada: col.idEvaluacionProgramada,
      calificacion: Number(valor),
      periodo: acta.periodo,
    };
    let peticion: Observable<unknown>;
    if (valor === '') {
      if (!actual.idNota) {
        return;
      }
      peticion = this.api.delete('evaluacion', `/api/v1/notas/${actual.idNota}`);
    } else {
      peticion = actual.idNota
        ? this.api.put('evaluacion', `/api/v1/notas/${actual.idNota}`, cuerpo)
        : this.api.post('evaluacion', '/api/v1/notas', cuerpo);
    }
    this.poner(clave, { ...actual, valor, estado: 'guardando' });
    peticion.subscribe({
      next: (r) => {
        const id = valor === '' ? null : Number((r as Fila)?.['id'] ?? actual.idNota);
        this.poner(clave, { valor, idNota: id, estado: 'ok' });
        this.recalcular();
      },
      error: (e) => this.poner(clave, { ...actual, valor, estado: 'error', error: textoError(e) }),
    });
  }

  private poner(clave: string, c: Celda): void {
    this.celdas.update((x) => ({ ...x, [clave]: c }));
  }

  /** Nota final con la misma formula del backend (vista resumen-competencias o acta-notas). */
  recalcular(): void {
    const acta = this.acta();
    if (!acta) {
      return;
    }
    const obs: Observable<Fila[]> =
      acta.modoEvaluacion === 'COMPETENCIA'
        ? this.api.get<Fila[]>('evaluacion', `/api/v1/vistas/resumen-competencias/${acta.idGrupo}`)
        : this.api.get<Fila>('evaluacion', `/api/v1/vistas/acta-notas/${acta.id}`).pipe(map((v) => (v['notas'] as Fila[]) ?? []));
    obs.pipe(catchError(() => of([] as Fila[]))).subscribe((filas) =>
      this.finales.set(
        new Map(
          filas.map((f) => [
            Number(f['idPersona']),
            {
              notaFinal: Number(f['notaFinal']),
              aprobado: Boolean(f['aprobado']),
              es: f['es'] as number,
              ep: f['ep'] as number,
              ecg: f['ecg'] as number | null,
            },
          ]),
        ),
      ),
    );
  }

  agregarEstudiante(): void {
    const id = Number(this.nuevoEstudiante);
    if (!id || this.estudiantes().some((e) => e.idPersona === id)) {
      return;
    }
    const nombre = this.personas().find((p) => Number(p.valor) === id)?.etiqueta ?? `Persona #${id}`;
    this.estudiantes.update((l) => [...l, { idPersona: id, nombre, origen: 'MANUAL' }]);
    const celdas = { ...this.celdas() };
    for (const col of this.columnas()) {
      celdas[`${id}:${col.clave}`] = { valor: '', idNota: null, estado: 'limpia' };
    }
    this.celdas.set(celdas);
    this.nuevoEstudiante = '';
  }

  etiquetaActa(a: Acta): string {
    return `${a.codigoCurso} · grupo #${a.idGrupo} · ${a.periodo} (${a.estado})`;
  }

  num(v: unknown): string {
    return v === null || v === undefined || Number.isNaN(Number(v)) ? '—' : Number(v).toFixed(2);
  }
}
