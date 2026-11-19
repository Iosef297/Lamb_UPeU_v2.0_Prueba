import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, forkJoin, map, switchMap, throwError } from 'rxjs';
import { Campo } from '../../features/microservicios/ms.model';
import { AcademicoApi, Fila, Opcion, Origen, insigniaEstado, textoCelda, textoOrigen } from '../academico-api';
import { DetalleModal } from '../comun/detalle-modal';
import { FormularioModal, textoError } from '../comun/formulario-modal';
import { TablaRecurso } from '../comun/tabla-recurso';
import { SesionUi } from '../comun/sesion-ui';
import { MODULOS } from '../modulos';
import { SinGuion } from '../../core/sin-guion.pipe';

interface PlanCurso {
  id: number;
  idCursoCatalogo: number;
  codigoCurso: string;
  nombreCurso: string;
  ciclo: number;
  creditos: number;
  horasTeoria: number;
  horasPractica: number;
  horasNoPresenciales: number;
  horasTotales: number;
  tipo: string;
  areaCurricular: string | null;
  prerrequisitos: string[];
}

interface Plan {
  id: number;
  idPrograma: number;
  idModalidad: number | null;
  version: string;
  nombre: string;
  estado: string;
  notaAprobatoria: number;
  numeroCursos: number;
  totalCreditos: number;
  totalHorasTeoria: number;
  totalHorasPractica: number;
  totalHorasNoPresenciales: number;
  totalHoras: number;
  fechaPublicacion: string | null;
  cursos: PlanCurso[];
}

// Ventana "Equivalencias" del curso (como en el LAMB: curso, unidad academica, CR, HT, HP, HNP, TH)
interface Equivalencia {
  id: number;
  tipo: string;
  observacion: string | null;
  codigoCursoDestino: string;
  nombreCursoDestino: string;
  versionPlanDestino: string;
  idProgramaDestino: number | null;
  nombrePlanDestino: string;
  cicloDestino: number;
  tipoCursoDestino: string | null;
  idDepartamentoDestino: number | null;
  creditosDestino: number;
  horasTeoriaDestino: number;
  horasPracticaDestino: number;
  horasNoPresencialesDestino: number;
  horasTotalesDestino: number;
}

interface Grupo {
  id: number;
  idPlan: number;
  nombre: string;
  cantidadElegir: number;
  idPlanCursos: number[];
  idCursosCatalogo: number[];
  enMalla: boolean;
}

// Fila de la malla: un curso normal o un grupo de electivos ("Electivo I", "Electivo II"...)
interface FilaMalla {
  curso: PlanCurso | null;
  grupo: { etiqueta: string; nombre: string; elegir: number; opciones: PlanCurso[]; creditos: number; ht: number; hp: number; th: number } | null;
}

// Ciclo del plan con sus limites de creditos (tablas ciclos_plan y creditos_ciclo)
interface CicloPlanFila {
  id: number;
  idPlan: number;
  numero: number;
  nombre: string;
}

interface CreditosCicloFila {
  id: number;
  idCicloPlan: number;
  creditosMinimos: number;
  creditosMaximos: number;
}

interface LimiteCiclo {
  num: number;
  nombre: string;
  idCicloPlan: number | null;
  idCreditos: number | null;
  minimo: number | null;
  maximo: number | null;
  enMalla: number;
  // sin-limites | ok | bajo | alto
  estado: string;
}

interface Formulario {
  titulo: string;
  icono: string;
  boton: string;
  campos: Campo[];
  inicial: Fila | null;
  extra: Record<string, Opcion[]>;
  accion: (cuerpo: Fila) => Observable<unknown>;
}

const RUTA = '/api/v1/planes-estudio';
const SIN_FIJOS: Record<string, unknown> = {};

// Que poner en cada campo del plan y de sus cursos (dudas frecuentes al registrar)
const AYUDAS: Record<string, string> = {
  idPrograma: 'Carrera dueña del plan. No se inventa ni lo asigna curriculo: se elige del CRUD Programas de lamb-institucional-ms.',
  version: 'Año y semestre desde el que ingresan los estudiantes que siguen este plan. El plan cambia una vez al año y siempre empieza en el primer semestre: AAAA-1. Ejemplos: 2026-1 · 2027-1 · 2028-1.',
  nombre: 'Nombre visible, p. ej. "Plan 2027 Ingeniería de Sistemas".',
  idModalidad: 'Modalidad de estudio (Ley Universitaria 30220, art. 39): Presencial, Semipresencial o A distancia. Opcional.',
  idCursoCatalogo: 'El curso (código, nombre y créditos) se registra antes en el CRUD Cursos catálogo; aquí solo se ubica en la malla.',
  ciclo: 'Ciclo de la malla en que se lleva el curso (1 a 14).',
  idTipoCurso: 'Obligatorio, Electivo o Requisito.',
  idAreaCurricular: 'Estudios generales, específicos o de especialidad (Ley 30220, art. 40). Opcional.',
  idPlanCursoRequisito: 'Solo cursos de ciclos anteriores de este mismo plan.',
};

interface Pestana {
  clave: string;
  etiqueta: string;
  // Recursos hijos del plan; campo = nombre del filtro que apunta al plan
  recursos: { ruta: string; etiqueta: string; campo: string }[];
}

const h = (r: string, etiqueta: string, campo = 'idPlan') => ({ ruta: '/api/v1/' + r, etiqueta, campo });

// Pestañas del detalle del plan (guia C2)
export const PESTANAS: Pestana[] = [
  { clave: 'malla', etiqueta: 'Malla', recursos: [] },
  { clave: 'ciclos', etiqueta: 'Ciclos y créditos', recursos: [] },
  { clave: 'electivos', etiqueta: 'Electivos y menciones', recursos: [h('grupos-electivos', 'Grupos de electivos'), h('menciones', 'Menciones')] },
  {
    clave: 'perfiles',
    etiqueta: 'Perfiles y competencias',
    recursos: [h('perfiles-ingreso', 'Perfil de ingreso'), h('perfiles-egreso', 'Perfil de egreso'), h('ejes-curriculares', 'Ejes curriculares')],
  },
  {
    clave: 'egreso',
    etiqueta: 'Requisitos de egreso',
    recursos: [
      h('requisitos-egreso', 'Créditos y promedio'),
      h('requisitos-idioma', 'Idiomas'),
      h('requisitos-practicas', 'Prácticas'),
      h('requisitos-investigacion', 'Investigación'),
      // Cursos de la malla que desarrollan cada línea de investigación (no se filtra por plan: va por idPlanCurso)
      h('cursos-investigacion', 'Cursos que desarrollan líneas de investigación', ''),
      h('requisitos-extracurriculares', 'Extracurriculares'),
    ],
  },
  { clave: 'titulacion', etiqueta: 'Titulación', recursos: [h('modalidades-titulacion', 'Modalidades de titulación')] },
  {
    clave: 'documentos',
    etiqueta: 'Documentos y normativa',
    recursos: [h('resoluciones-plan', 'Resoluciones'), h('mallas-curriculares', 'Mallas en PDF'), h('vigencias-cohorte', 'Vigencia por cohorte')],
  },
  {
    clave: 'evaluacion',
    etiqueta: 'Evaluación curricular',
    recursos: [h('evaluaciones-curriculares', 'Evaluaciones de la comisión'), h('solicitudes-modificacion-curricular', 'Solicitudes de modificación')],
  },
];

/** Plan de estudios por ciclos (PlanAcademico del diseño) con gestion de cursos y prerrequisitos. */
@Component({
  selector: 'ac-plan-estudios',
  imports: [SinGuion, FormularioModal, DetalleModal, TablaRecurso],
  templateUrl: './plan-estudios.html',
})
export class PlanEstudios {
  readonly api = inject(AcademicoApi);
  private readonly sesion = inject(SesionUi);

  readonly planes = signal<Plan[]>([]);
  readonly idPlan = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly formulario = signal<Formulario | null>(null);
  readonly detalle = signal<Fila | null>(null);
  readonly equivalencias = signal<{ curso: PlanCurso; filas: Equivalencia[] | null } | null>(null);
  readonly prerrequisitosDe = signal<PlanCurso | null>(null);
  readonly porQuitar = signal<number | null>(null);
  readonly grupos = signal<Grupo[]>([]);
  readonly gruposAbierto = signal<NonNullable<FilaMalla['grupo']> | null>(null);
  readonly porEliminarPlan = signal(false);
  readonly porDerogar = signal(false);
  readonly ciclosPlan = signal<CicloPlanFila[]>([]);
  readonly creditosCiclo = signal<CreditosCicloFila[]>([]);
  // Cohortes que siguen cada plan (cada estudiante termina con el plan con el que ingreso)
  readonly vigencias = signal<Fila[]>([]);
  readonly porQuitarGrupo = signal<string | null>(null);
  readonly pestanas = PESTANAS;
  readonly pestana = signal<Pestana>(PESTANAS[0]);
  readonly ayudas = AYUDAS;
  readonly textoOrigen = textoOrigen;

  // Nombres de programa (institucional) y modalidad (curriculo) en vez del id suelto
  private readonly nombresPrograma = toSignal(this.api.nombresPrograma(), { initialValue: new Map<string, string>() });
  private readonly modalidades = toSignal(
    this.api.opciones(this.api.referencia('curriculo', 'idModalidad')!).pipe(map((o) => new Map(o.map((x) => [String(x.valor), x.etiqueta])))),
    { initialValue: new Map<string, string>() },
  );
  readonly origenPrograma = this.api.origen('curriculo', 'idPrograma') as Origen;
  readonly origenModalidad = this.api.origen('curriculo', 'idModalidad') as Origen;
  // Unidad academica de la equivalencia: departamento de lamb-institucional-ms (solo llega el id)
  private readonly departamentos = toSignal(
    this.api.opciones(this.api.referencia('curriculo', 'idDepartamento')!).pipe(map((o) => new Map(o.map((x) => [String(x.valor), x.etiqueta])))),
    { initialValue: new Map<string, string>() },
  );
  readonly origenDepartamento = this.api.origen('curriculo', 'idDepartamento') as Origen;
  readonly origenCurso = this.api.origen('curriculo', 'idCursoCatalogo') as Origen;
  readonly origenTipo = this.api.origen('curriculo', 'idTipoCurso') as Origen;

  programa(id: number | null | undefined): string {
    return id === null || id === undefined ? '—' : (this.nombresPrograma().get(String(id)) ?? `Programa #${id}`);
  }

  departamento(id: number | null | undefined): string {
    return id == null ? '—' : (this.departamentos().get(String(id)) ?? `Departamento #${id}`);
  }

  modalidad(id: number | null | undefined): string {
    return id === null || id === undefined ? 'Sin modalidad' : (this.modalidades().get(String(id)) ?? `Modalidad #${id}`);
  }

  readonly puedeEscribir = computed(() => this.sesion.puedeEscribir(MODULOS[0].rolesEscritura));

  // Planes del programa elegido arriba (vacio = todos los programas)
  readonly planesVisibles = computed(() => {
    const prog = this.api.programa();
    return this.planes().filter((p) => !prog || String(p.idPrograma) === prog);
  });

  // Plan mostrado: el elegido si es del programa; si no, el VIGENTE del programa o el primero
  readonly plan = computed(() => {
    const lista = this.planesVisibles();
    return lista.find((p) => p.id === this.idPlan()) ?? lista.find((p) => p.estado === 'VIGENTE') ?? lista[0] ?? null;
  });

  // Solo un plan en BORRADOR acepta cambios en la malla (regla del backend)
  readonly editablePlan = computed(() => this.puedeEscribir() && this.plan()?.estado === 'BORRADOR');

  // Grupos de electivos del plan mostrado, numerados en orden de ciclo: Electivo I, II...
  readonly gruposDelPlan = computed(() => {
    const p = this.plan();
    if (!p) {
      return [];
    }
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const cicloDe = (g: Grupo) => Math.min(...g.idPlanCursos.map((id) => p.cursos.find((c) => c.id === id)?.ciclo ?? 99));
    return this.grupos()
      .filter((g) => g.idPlan === p.id && g.idPlanCursos.length > 0)
      .sort((a, b) => cicloDe(a) - cicloDe(b) || a.id - b.id)
      .map((g, i) => ({ g, etiqueta: `Electivo ${roman[i] ?? i + 1}`, opciones: p.cursos.filter((c) => g.idPlanCursos.includes(c.id)) }))
      .filter((x) => x.opciones.length > 0);
  });

  readonly ciclos = computed(() => {
    const p = this.plan();
    if (!p) {
      return [];
    }
    const grupos = this.gruposDelPlan();
    const enGrupo = new Set(grupos.flatMap((x) => x.opciones.map((o) => o.id)));
    const porCiclo = new Map<number, FilaMalla[]>();
    const poner = (ciclo: number, fila: FilaMalla) => porCiclo.set(ciclo, [...(porCiclo.get(ciclo) ?? []), fila]);
    for (const c of p.cursos) {
      if (!enGrupo.has(c.id)) {
        poner(c.ciclo, { curso: c, grupo: null });
      }
    }
    for (const x of grupos) {
      const ref = x.opciones[0];
      poner(ref.ciclo, {
        curso: null,
        grupo: {
          etiqueta: x.etiqueta,
          nombre: x.g.nombre,
          elegir: x.g.cantidadElegir,
          opciones: x.opciones,
          creditos: ref.creditos * x.g.cantidadElegir,
          ht: ref.horasTeoria,
          hp: ref.horasPractica,
          th: ref.horasTotales,
        },
      });
    }
    return [...porCiclo.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([num, filas]) => ({
        num,
        filas: filas.sort((a, b) => Number(!!a.grupo) - Number(!!b.grupo)),
        creditos: filas.reduce((s, f) => s + (f.grupo ? f.grupo.creditos : (f.curso?.creditos ?? 0)), 0),
      }));
  });

  // Un renglon por ciclo: nombre, creditos que lleva la malla y limites minimo/maximo con su estado
  readonly limitesCiclo = computed<LimiteCiclo[]>(() => {
    const p = this.plan();
    if (!p) {
      return [];
    }
    const ciclosDelPlan = this.ciclosPlan().filter((c) => c.idPlan === p.id);
    const enMalla = new Map(this.ciclos().map((c) => [c.num, c.creditos]));
    const numeros = new Set<number>([...enMalla.keys(), ...ciclosDelPlan.map((c) => c.numero)]);
    return [...numeros]
      .sort((a, b) => a - b)
      .map((num) => {
        const ciclo = ciclosDelPlan.find((c) => c.numero === num);
        const lim = ciclo ? this.creditosCiclo().find((x) => x.idCicloPlan === ciclo.id) : undefined;
        const creditos = enMalla.get(num) ?? 0;
        let estado = 'sin-limites';
        if (lim) {
          estado = creditos < lim.creditosMinimos ? 'bajo' : creditos > lim.creditosMaximos ? 'alto' : 'ok';
        }
        return {
          num,
          nombre: ciclo?.nombre ?? `Ciclo ${num}`,
          idCicloPlan: ciclo?.id ?? null,
          idCreditos: lim?.id ?? null,
          minimo: lim?.creditosMinimos ?? null,
          maximo: lim?.creditosMaximos ?? null,
          enMalla: creditos,
          estado,
        };
      });
  });

  /** El ciclo ya llego a su maximo de creditos: no se pueden agregar mas cursos. */
  cicloLleno(num: number): boolean {
    const l = this.limiteDe(num);
    return !!l && l.maximo !== null && l.enMalla >= l.maximo;
  }

  limiteDe(num: number): LimiteCiclo | undefined {
    return this.limitesCiclo().find((l) => l.num === num);
  }

  // Créditos del plan contando solo lo que el estudiante lleva (de cada grupo de electivos se elige N)
  readonly creditosPlan = computed(() => this.ciclos().reduce((s, c) => s + c.creditos, 0));

  // "2027-0 → 2027-2": cohortes de ingreso que terminan con este plan
  readonly cohortesPlan = computed(() => {
    const id = this.plan()?.id;
    const v = this.vigencias()
      .filter((x) => Number(x['idPlan']) === id)
      .sort((a, b) => String(a['cohorteInicio']).localeCompare(String(b['cohorteInicio'])));
    return v.length === 0 ? 'Sin cohortes' : v.map((x) => `${x['cohorteInicio']} → ${x['cohorteFin'] ?? 'en adelante'}`).join(' · ');
  });

  readonly insigniaPlan = computed(() => insigniaEstado(this.plan()?.estado));

  constructor() {
    // Lo que se ve en pantalla es el plan con el que se trabaja en todas las demas pantallas
    effect(() => {
      const p = this.plan();
      if (p) {
        untracked(() => this.api.fijarPlan(p.id));
      }
    });
    this.cargar();
  }

  cargar(seleccion?: number): void {
    this.cargando.set(true);
    this.api.get<Plan[]>('curriculo', RUTA).subscribe({
      next: (planes) => {
        this.planes.set(planes);
        const actual = seleccion ?? this.idPlan() ?? (Number(this.api.plan()) || null);
        const elegido = planes.find((p) => p.id === actual) ?? planes.find((p) => p.estado === 'VIGENTE') ?? planes[0];
        this.idPlan.set(elegido?.id ?? null);
        this.cargando.set(false);
        this.api.listar('curriculo', '/api/v1/vigencias-cohorte').subscribe({ next: (v) => this.vigencias.set(v), error: () => this.vigencias.set([]) });
        this.api.get<CicloPlanFila[]>('curriculo', '/api/v1/ciclos-plan').subscribe({ next: (c) => this.ciclosPlan.set(c), error: () => this.ciclosPlan.set([]) });
        this.api.get<CreditosCicloFila[]>('curriculo', '/api/v1/creditos-ciclo').subscribe({ next: (c) => this.creditosCiclo.set(c), error: () => this.creditosCiclo.set([]) });
        this.api.get<Grupo[]>('curriculo', '/api/v1/grupos-electivos').subscribe({
          next: (g) => this.grupos.set(g),
          error: () => this.grupos.set([]),
        });
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(textoError(e));
      },
    });
  }

  elegir(valor: string): void {
    this.idPlan.set(Number(valor));
    this.api.fijarPlan(valor);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  private recurso() {
    return this.api.recurso('curriculo', RUTA)!;
  }

  nuevoPlan(): void {
    this.formulario.set({
      titulo: 'Nuevo plan de estudios',
      icono: '',
      boton: 'Registrar plan',
      campos: this.recurso().crear!.campos,
      // Con un programa elegido arriba, el plan nuevo es de ese programa
      inicial: this.api.programa() ? { idPrograma: Number(this.api.programa()) } : null,
      extra: {},
      accion: (cuerpo) => this.api.post('curriculo', RUTA, cuerpo),
    });
  }

  editarPlan(): void {
    const p = this.plan();
    if (!p) {
      return;
    }
    this.formulario.set({
      titulo: `Editar plan · ${p.nombre}`,
      icono: '',
      boton: 'Guardar cambios',
      campos: this.recurso().actualizar!.campos,
      inicial: p as unknown as Fila,
      extra: {},
      accion: (cuerpo) => this.api.put('curriculo', `${RUTA}/${p.id}`, cuerpo),
    });
  }

  agregarCurso(ciclo?: number): void {
    const p = this.plan();
    const op = this.recurso().acciones.find((a) => a.ruta === '/{id}/cursos');
    if (!p || !op) {
      return;
    }
    // Solo cursos del programa del plan: los de sus planes y los creados en el programa (no los de otras carreras)
    this.api.listar('curriculo', '/api/v1/cursos-catalogo').subscribe({
      next: (catalogo) => {
        const delPrograma = new Set<number>();
        this.planes()
          .filter((pl) => pl.idPrograma === p.idPrograma)
          .forEach((pl) => pl.cursos.forEach((c) => delPrograma.add(c.idCursoCatalogo)));
        catalogo.filter((c) => c['idPrograma'] === p.idPrograma).forEach((c) => delPrograma.add(Number(c['id'])));
        // Los cursos tomados por un grupo de electivos no se ofrecen como cursos sueltos
        const yaEnPlan = new Set(p.cursos.map((c) => c.idCursoCatalogo));
        this.grupos().filter((g) => g.idPlan === p.id).forEach((g) => g.idCursosCatalogo.forEach((id) => yaEnPlan.add(id)));
        const opciones = catalogo
          .filter((c) => delPrograma.has(Number(c['id'])) && !yaEnPlan.has(Number(c['id'])))
          .sort((a, b) => String(a['codigo']).localeCompare(String(b['codigo'])))
          .map((c) => ({ valor: c['id'], etiqueta: `${c['codigo']} · ${c['nombre']} (${c['creditos']} cr)` }));
        this.formulario.set({
          titulo: `Agregar curso al plan ${p.version}`,
          icono: '',
          boton: 'Agregar curso',
          campos: op.campos,
          inicial: ciclo ? { ciclo } : null,
          extra: { idCursoCatalogo: opciones },
          accion: (cuerpo) => this.api.post('curriculo', `${RUTA}/${p.id}/cursos`, cuerpo),
        });
      },
      error: (e) => this.error.set(textoError(e)),
    });
  }

  /** Pone en la malla un grupo de electivos ya definido (Estructura curricular > Electivos y menciones): nombre y ciclo. */
  agregarElectivo(ciclo?: number): void {
    const p = this.plan();
    if (!p) {
      return;
    }
    const porUbicar = this.grupos().filter((g) => g.idPlan === p.id && !g.enMalla);
    if (porUbicar.length === 0) {
      this.error.set('No hay grupos de electivos por ubicar en este plan. Créalos primero en Estructura curricular > Electivos y menciones.');
      return;
    }
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const numero = this.gruposDelPlan().length;
    const campos: Campo[] = [
      { nombre: 'idGrupo', etiqueta: 'Grupo de electivos', tipo: 'number', requerido: true },
      { nombre: 'nombre', etiqueta: 'Nombre en la malla', tipo: 'text', requerido: true, max: 150 },
      { nombre: 'ciclo', etiqueta: 'Ciclo', tipo: 'number', requerido: true },
    ];
    this.formulario.set({
      titulo: `Añadir electivo al plan ${p.version}`,
      icono: '',
      boton: 'Añadir electivo',
      campos,
      inicial: { nombre: `Electivo ${roman[numero] ?? numero + 1}`, ...(ciclo ? { ciclo } : {}) },
      extra: { idGrupo: porUbicar.map((g) => ({ valor: g.id, etiqueta: `${g.nombre} · ${g.idCursosCatalogo.length} cursos · elegir ${g.cantidadElegir}` })) },
      accion: (cuerpo) => this.api.post('curriculo', `/api/v1/grupos-electivos/${cuerpo['idGrupo']}/ubicar`, { nombre: cuerpo['nombre'], ciclo: cuerpo['ciclo'] }),
    });
  }

  /** Define el nombre y los limites de creditos de un ciclo (crea el ciclo del plan si todavia no existe). */
  definirLimites(l: LimiteCiclo): void {
    const p = this.plan();
    if (!p) {
      return;
    }
    const campos: Campo[] = [
      { nombre: 'nombre', etiqueta: 'Nombre del ciclo', tipo: 'text', requerido: true, max: 50 },
      { nombre: 'creditosMinimos', etiqueta: 'Créditos mínimos', tipo: 'number', requerido: true },
      { nombre: 'creditosMaximos', etiqueta: 'Créditos máximos', tipo: 'number', requerido: true },
    ];
    this.formulario.set({
      titulo: `Límites del ${l.nombre.toLowerCase()} · plan ${p.version}`,
      icono: '',
      boton: 'Guardar límites',
      campos,
      inicial: { nombre: l.nombre, ...(l.minimo !== null ? { creditosMinimos: l.minimo } : {}), ...(l.maximo !== null ? { creditosMaximos: l.maximo } : {}) },
      extra: {},
      accion: (cuerpo) => {
        const min = Number(cuerpo['creditosMinimos']);
        const max = Number(cuerpo['creditosMaximos']);
        if (max < min) {
          return throwError(() => ({ status: 400, error: { message: 'Los créditos máximos no pueden ser menores que los mínimos.' } }));
        }
        const ciclo = { idPlan: p.id, numero: l.num, nombre: String(cuerpo['nombre']) };
        const asegurarCiclo: Observable<{ id: number }> = l.idCicloPlan
          ? this.api.put<{ id: number }>('curriculo', `/api/v1/ciclos-plan/${l.idCicloPlan}`, ciclo)
          : this.api.post<{ id: number }>('curriculo', '/api/v1/ciclos-plan', ciclo);
        return asegurarCiclo.pipe(
          switchMap((c) => {
            const limites = { idCicloPlan: c.id, creditosMinimos: min, creditosMaximos: max };
            return l.idCreditos
              ? this.api.put('curriculo', `/api/v1/creditos-ciclo/${l.idCreditos}`, limites)
              : this.api.post('curriculo', '/api/v1/creditos-ciclo', limites);
          }),
        );
      },
    });
  }

  agregarPrerrequisito(curso: PlanCurso): void {
    const p = this.plan();
    const op = this.recurso().acciones.find((a) => a.ruta === '/{id}/cursos/{idPlanCurso}/prerrequisitos');
    if (!p || !op) {
      return;
    }
    const candidatos = p.cursos
      .filter((c) => c.ciclo < curso.ciclo && !curso.prerrequisitos.includes(c.codigoCurso))
      .map((c) => ({ valor: c.id, etiqueta: `Ciclo ${c.ciclo} · ${c.codigoCurso} · ${c.nombreCurso}` }));
    this.formulario.set({
      titulo: `Prerrequisito de ${curso.codigoCurso} · ${curso.nombreCurso}`,
      icono: '',
      boton: 'Agregar prerrequisito',
      campos: op.campos,
      inicial: null,
      extra: { idPlanCursoRequisito: candidatos },
      accion: (cuerpo) => this.api.post('curriculo', `${RUTA}/${p.id}/cursos/${curso.id}/prerrequisitos`, cuerpo),
    });
  }

  quitarPrerrequisito(curso: PlanCurso, codigo: string): void {
    const p = this.plan();
    const requisito = p?.cursos.find((c) => c.codigoCurso === codigo);
    if (!p || !requisito) {
      return;
    }
    this.ejecutar(this.api.delete('curriculo', `${RUTA}/${p.id}/cursos/${curso.id}/prerrequisitos/${requisito.id}`), `Prerrequisito ${codigo} quitado de ${curso.codigoCurso}.`);
  }

  quitarCurso(curso: PlanCurso): void {
    const p = this.plan();
    if (!p) {
      return;
    }
    this.porQuitar.set(null);
    this.gruposAbierto.set(null);
    this.ejecutar(this.api.delete('curriculo', `${RUTA}/${p.id}/cursos/${curso.id}`), `Curso ${curso.codigoCurso} quitado del plan.`);
  }

  eliminarBorrador(): void {
    const p = this.plan();
    if (!p || p.estado !== 'BORRADOR') {
      return;
    }
    this.porEliminarPlan.set(false);
    this.idPlan.set(null);
    this.ejecutar(this.api.delete('curriculo', `${RUTA}/${p.id}`), `Borrador ${p.version} eliminado por completo.`);
  }

  /** Quita de la malla todas las opciones de un grupo de electivos (el grupo desaparece de la malla). */
  quitarGrupo(g: NonNullable<FilaMalla['grupo']>): void {
    const p = this.plan();
    if (!p) {
      return;
    }
    this.porQuitarGrupo.set(null);
    this.ejecutar(
      forkJoin(g.opciones.map((o) => this.api.delete('curriculo', `${RUTA}/${p.id}/cursos/${o.id}`))),
      `${g.etiqueta} quitado de la malla (el grupo sigue definido en Electivos y menciones).`,
    );
  }

  derogar(): void {
    const p = this.plan();
    if (!p || p.estado !== 'EN_EXTINCION') {
      return;
    }
    this.porDerogar.set(false);
    this.ejecutar(this.api.post('curriculo', `${RUTA}/${p.id}/derogar`), `Plan ${p.version} derogado: cierre definitivo.`);
  }

  clonar(): void {
    const p = this.plan();
    if (!p) {
      return;
    }
    const campos: Campo[] = [
      { nombre: 'version', etiqueta: 'Versión nueva', tipo: 'text', requerido: true, max: 20 },
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text', requerido: true, max: 150 },
    ];
    this.formulario.set({
      titulo: `Nueva versión a partir del plan ${p.version}`,
      icono: '',
      boton: 'Crear borrador',
      campos,
      inicial: { nombre: p.nombre },
      extra: {},
      accion: (cuerpo) => this.api.post('curriculo', `${RUTA}/${p.id}/clonar`, cuerpo),
    });
  }

  editarCurso(c: PlanCurso): void {
    const p = this.plan();
    if (!p) {
      return;
    }
    const campos: Campo[] = [
      { nombre: 'ciclo', etiqueta: 'Ciclo', tipo: 'number', requerido: true },
      { nombre: 'idTipoCurso', etiqueta: 'Tipo de curso', tipo: 'number', requerido: true },
      { nombre: 'idAreaCurricular', etiqueta: 'Área curricular', tipo: 'number', requerido: false },
    ];
    this.formulario.set({
      titulo: `Editar ${c.codigoCurso} · ${c.nombreCurso}`,
      icono: '',
      boton: 'Guardar cambios',
      campos,
      inicial: { ciclo: c.ciclo },
      extra: {},
      accion: (cuerpo) => this.api.put('curriculo', `${RUTA}/${p.id}/cursos/${c.id}`, cuerpo),
    });
  }

  fijos(campo: string): Record<string, unknown> {
    return campo ? { [campo]: this.plan()?.id ?? null } : SIN_FIJOS;
  }

  publicar(): void {
    const p = this.plan();
    if (!p) {
      return;
    }
    this.ejecutar(this.api.post('curriculo', `${RUTA}/${p.id}/publicar`), `Plan ${p.version} publicado: se notificó a planificación (plan.publicado).`);
  }

  verEquivalencias(c: PlanCurso): void {
    this.equivalencias.set({ curso: c, filas: null });
    this.api.get<Equivalencia[]>('curriculo', '/api/v1/equivalencias-plan', { idPlanCursoOrigen: c.id }).subscribe({
      next: (filas) => this.equivalencias.set({ curso: c, filas }),
      error: (e) => {
        this.equivalencias.set(null);
        this.error.set(textoError(e));
      },
    });
  }

  /** Cursos que pide `c` como prerrequisito, con sus datos (ciclo, creditos, horas, tipo). */
  requisitosDe(c: PlanCurso): PlanCurso[] {
    const cursos = this.plan()?.cursos ?? [];
    return c.prerrequisitos
      .map((cod) => cursos.find((x) => x.codigoCurso === cod))
      .filter((x): x is PlanCurso => !!x)
      .sort((a, b) => a.ciclo - b.ciclo || a.codigoCurso.localeCompare(b.codigoCurso));
  }

  /** Cursos para los que `c` es prerrequisito. */
  requeridoPor(c: PlanCurso): PlanCurso[] {
    return (this.plan()?.cursos ?? [])
      .filter((x) => x.prerrequisitos.includes(c.codigoCurso))
      .sort((a, b) => a.ciclo - b.ciclo || a.codigoCurso.localeCompare(b.codigoCurso));
  }

  verCurso(c: PlanCurso): void {
    this.detalle.set(c as unknown as Fila);
  }

  private ejecutar(obs: Observable<unknown>, texto: string): void {
    this.error.set(null);
    obs.subscribe({
      next: () => this.listo(texto),
      error: (e) => this.error.set(textoError(e)),
    });
  }

  guardado(): void {
    this.formulario.set(null);
    this.listo('Cambios guardados correctamente.');
  }

  private listo(texto: string): void {
    this.api.invalidar('curriculo', RUTA);
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 4000);
    this.cargar();
  }

  texto(v: unknown): string {
    return textoCelda(v);
  }
}
