import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { Campo, Operacion, Recurso } from '../../features/microservicios/ms.model';
import { AcademicoApi, Fila, Opcion, Origen, esCampoEstado, humanizar, insigniaEstado, textoCelda, textoOrigen } from '../academico-api';
import { AYUDAS_RECURSO, ClaveModulo, buscarModulo } from '../modulos';
import { DetalleModal } from './detalle-modal';
import { FormularioModal, textoError } from './formulario-modal';
import { SesionUi } from './sesion-ui';

interface Columna {
  clave: string;
  titulo: string;
  tipo: 'n' | 'cod' | 'fuerte' | 'estado' | 'normal';
}

interface Formulario {
  titulo: string;
  icono: string;
  boton: string;
  campos: Campo[];
  inicial: Fila | null;
  accion: (cuerpo: Fila) => Observable<unknown>;
  // Lo ya elegido (plan...): no se pide de nuevo
  ocultos?: Fila;
  contexto?: string;
  opcionesExtra?: Record<string, Opcion[]>;
}

// ruta del recurso -> campo que lo une a un curso del catalogo
const ALCANCE: Record<string, string> = {
  '/api/v1/cursos-catalogo': 'id',
  '/api/v1/sumillas-curso': 'idCurso',
  '/api/v1/silabos-base': 'idCurso',
  '/api/v1/resultados-aprendizaje': 'idCurso',
  '/api/v1/unidades-aprendizaje': 'idSilabo',
};

const ICONOS_ESTADO = ['', '', '', ''];

// Tablas con miles de filas: no se cargan hasta elegir este filtro (el backend devuelve solo lo filtrado)
const FILTRO_REQUERIDO: Record<string, string> = {
  '/api/v1/registros-asistencia': 'idGrupo',
  '/api/v1/notas': 'idGrupo',
  '/api/v1/evaluaciones-programadas': 'idGrupo',
  '/api/v1/respuestas-encuesta': 'idPregunta',
};
const FILAS_POR_TANDA = 200;

// Filtros desplegables que apuntan a un plan de estudios
const FILTROS_PLAN = ['idPlan', 'idPlanOrigen', 'idPlanDestino'];

/**
 * Tabla CRUD de un recurso del catalogo con el diseño de MisSolicitudes: resumen, filtros, busqueda,
 * crear / editar / acciones / eliminar. Con `fijos` queda filtrada por un padre (ej. idPlan, idGrupo):
 * ese filtro no se muestra y se prellena al crear. Se usa en las secciones y en las pestañas de detalle.
 */
@Component({
  selector: 'ac-tabla-recurso',
  imports: [FormsModule, FormularioModal, DetalleModal],
  templateUrl: './tabla-recurso.html',
})
export class TablaRecurso {
  readonly api = inject(AcademicoApi);
  readonly sesion = inject(SesionUi);

  readonly modulo = input.required<ClaveModulo>();
  readonly ruta = input.required<string>();
  readonly etiqueta = input('Registros');
  readonly fijos = input<Fila>({});
  readonly conResumen = input(true);

  readonly filas = signal<Fila[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly busqueda = signal('');
  readonly filtros = signal<Fila>({});
  readonly opcionesFiltro = signal<Record<string, Opcion[]>>({});
  // El usuario dejo el filtro de plan en "Todos" a proposito: no se vuelve a elegir uno solo
  private readonly planManual = signal(false);
  private readonly planesInfo = signal<Fila[]>([]);
  readonly formulario = signal<Formulario | null>(null);
  readonly limite = signal(FILAS_POR_TANDA);

  /** Filtro que falta elegir para cargar una tabla grande (null si ya se puede cargar). */
  readonly filtroFaltante = computed(() => {
    const campo = FILTRO_REQUERIDO[this.ruta()];
    if (!campo || campo in this.fijos() || this.filtros()[campo]) {
      return null;
    }
    return campo;
  });

  readonly visibles = computed(() => this.filtradas().slice(0, this.limite()));
  readonly detalle = signal<Fila | null>(null);
  readonly porEliminar = signal<unknown>(null);

  readonly recurso = computed<Recurso | null>(() => this.api.recurso(this.modulo(), this.ruta()) ?? null);

  readonly puedeEscribir = computed(() => {
    const m = buscarModulo(this.modulo());
    return !!m && this.sesion.puedeEscribir(m.rolesEscritura);
  });

  // Filtros visibles: los del endpoint menos los fijados por el padre
  readonly params = computed(() =>
    (this.recurso()?.listar?.params ?? []).filter(
      (p) => !(p.nombre in this.fijos()) && !(this.alcance() && p.nombre === 'idDepartamento'),
    ),
  );

  // Catalogo de cursos: con un programa elegido solo se ve lo que pertenece a su plan de estudios
  readonly cursosDelPrograma = signal<Set<number> | null>(null);
  private readonly silaboCurso = signal<Map<number, number>>(new Map());
  readonly alcance = computed(() => (this.api.programa() && !Object.keys(this.fijos()).length ? ALCANCE[this.ruta()] : undefined));

  // Desplegables "Filtrar por curso / silabo": solo los del programa elegido
  readonly opcionesVisibles = computed<Record<string, Opcion[]>>(() => {
    const todas = this.opcionesFiltro();
    const ids = this.cursosDelPrograma();
    if (!this.api.programa() || Object.keys(this.fijos()).length) {
      return todas;
    }
    const salida: Record<string, Opcion[]> = { ...todas };
    if (todas['idCurso']) {
      salida['idCurso'] = ids ? todas['idCurso'].filter((o) => ids.has(Number(o.valor))) : [];
    }
    // "Filtrar por plan": solo los planes del programa elegido
    const planes = this.programaDePlan();
    for (const nombre of FILTROS_PLAN) {
      if (todas[nombre]) {
        salida[nombre] = planes ? todas[nombre].filter((o) => String(planes.get(Number(o.valor))) === this.api.programa()) : [];
      }
    }
    // "Filtrar por grupo": solo los grupos del periodo del contexto (la etiqueta empieza por el periodo)
    if (todas['idGrupo'] && this.api.periodo()) {
      salida['idGrupo'] = todas['idGrupo'].filter((o) => o.etiqueta.startsWith(this.api.periodo() + ' '));
    }
    // "Filtrar por tabla": solo las tablas de planes del programa elegido
    if (todas['idTabla']) {
      const tablas = this.programaDeTabla();
      salida['idTabla'] = tablas ? todas['idTabla'].filter((o) => String(tablas.get(Number(o.valor))) === this.api.programa()) : [];
    }
    if (todas['idSilabo']) {
      const mapa = this.silaboCurso();
      salida['idSilabo'] = ids ? todas['idSilabo'].filter((o) => ids.has(mapa.get(Number(o.valor)) ?? -1)) : [];
    }
    return salida;
  });

  // Alcance generico por programa: la fila pertenece al programa directo (idPrograma) o por su padre (plan, oferta, grupo)
  private readonly programaDePlan = signal<Map<number, number> | null>(null);
  private readonly programaDeOferta = signal<Map<number, number> | null>(null);
  private readonly programaDeGrupo = signal<Map<number, number> | null>(null);
  private readonly programaDeTabla = signal<Map<number, number> | null>(null);
  private readonly programaDeComision = signal<Map<number, number> | null>(null);
  readonly campoPadre = computed<'idPrograma' | 'idPlan' | 'idOferta' | 'idGrupo' | 'idTabla' | 'idComision' | null>(() => {
    if (this.alcance() || !this.api.programa() || Object.keys(this.fijos()).length) {
      return null;
    }
    const muestra = this.filas()[0];
    if (!muestra) {
      return null;
    }
    return (['idPrograma', 'idPlan', 'idOferta', 'idGrupo', 'idTabla', 'idComision'] as const).find((c) => c in muestra) ?? null;
  });

  readonly base = computed<Fila[]>(() => {
    const campo = this.alcance();
    const ids = this.cursosDelPrograma();
    const padre = this.campoPadre();
    if (padre) {
      const prog = this.api.programa();
      if (padre === 'idPrograma') {
        return this.filas().filter((f) => String(f['idPrograma']) === prog);
      }
      const mapa =
        padre === 'idPlan' ? this.programaDePlan() : padre === 'idOferta' ? this.programaDeOferta() : padre === 'idTabla' ? this.programaDeTabla() : padre === 'idComision' ? this.programaDeComision() : this.programaDeGrupo();
      return mapa ? this.filas().filter((f) => String(mapa.get(Number(f[padre]))) === prog) : [];
    }
    if (!campo) {
      return this.filas();
    }
    if (!ids) {
      return [];
    }
    return this.filas().filter((f) => {
      const v = Number(f[campo]);
      return campo === 'idSilabo' ? ids.has(this.silaboCurso().get(v) ?? -1) : ids.has(v);
    });
  });

  readonly columnas = computed<Columna[]>(() => columnasDe(this.base(), this.recurso(), Object.keys(this.fijos())));

  readonly textoOrigen = textoOrigen;
  readonly ayudas = computed(() => AYUDAS_RECURSO[this.ruta()] ?? {});

  // Ids del recurso que vienen de otro CRUD (columnas visibles + campos del formulario de alta)
  readonly origenesTabla = computed(() => {
    const campos = new Set<string>([...this.columnas().map((c) => c.clave), ...(this.recurso()?.crear?.campos ?? []).map((c) => c.nombre)]);
    return [...campos]
      .map((campo) => ({ campo, titulo: humanizar(campo), origen: this.api.origen(this.modulo(), campo) }))
      .filter((x): x is { campo: string; titulo: string; origen: Origen } => !!x.origen);
  });

  origenCol(campo: string): Origen | undefined {
    return campo === 'id' ? undefined : this.api.origen(this.modulo(), campo);
  }

  readonly filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) {
      return this.base();
    }
    return this.base().filter((f) => Object.values(f).some((v) => v !== null && typeof v !== 'object' && String(v).toLowerCase().includes(q)));
  });

  readonly resumen = computed(() => {
    const filas = this.base();
    const tarjetas = [{ etiqueta: 'Total', valor: filas.length, icono: '', color: '#1E3A8A' }];
    const campo = ['estado', 'activo', 'aprobado', 'vigente'].find((c) => filas.some((f) => f[c] !== undefined && f[c] !== null));
    if (campo) {
      const conteo = new Map<string, number>();
      filas.forEach((f) => conteo.set(textoCelda(f[campo]), (conteo.get(textoCelda(f[campo])) ?? 0) + 1));
      [...conteo.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([k, v], i) =>
          tarjetas.push({
            etiqueta: campo === 'estado' ? capital(k) : `${humanizar(campo)}: ${k}`,
            valor: v,
            icono: ICONOS_ESTADO[i],
            color: insigniaEstado(k === 'Sí' ? 'SI' : k === 'No' ? 'NO' : k.replace(/ /g, '_')).color,
          }),
        );
    }
    return tarjetas;
  });

  constructor() {
    // Cursos del plan de estudios del programa elegido
    effect(() => {
      const prog = this.api.programa();
      const ruta = this.ruta();
      untracked(() => {
        this.cursosDelPrograma.set(null);
        const nombres = this.params().map((x) => x.nombre);
        const filtraCurso = nombres.includes('idCurso') || nombres.includes('idSilabo');
        if (!prog || (!ALCANCE[ruta] && !filtraCurso)) {
          return;
        }
        this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((planes) => {
          const ids = new Set<number>();
          planes
            .filter((pl) => String(pl['idPrograma']) === prog)
            .forEach((pl) => ((pl['cursos'] as Fila[]) ?? []).forEach((c) => ids.add(Number(c['idCursoCatalogo']))));
          // Cursos creados en este programa, aunque todavia no esten en ningun plan
          this.api.listar('curriculo', '/api/v1/cursos-catalogo').subscribe({
            next: (cs) => {
              cs.filter((c) => String(c['idPrograma']) === prog).forEach((c) => ids.add(Number(c['id'])));
              this.cursosDelPrograma.set(new Set(ids));
            },
            error: () => this.cursosDelPrograma.set(ids),
          });
        });
        if (ALCANCE[ruta] === 'idSilabo' || nombres.includes('idSilabo')) {
          this.api.listar('curriculo', '/api/v1/silabos-base').subscribe((s) => this.silaboCurso.set(new Map(s.map((x) => [Number(x['id']), Number(x['idCurso'])]))));
        }
      });
    });
    // Mapas padre -> programa, solo el que la tabla necesita
    effect(() => {
      const padre = this.campoPadre();
      const filtraPlan = this.params().some((p) => FILTROS_PLAN.includes(p.nombre));
      const filtraTabla = this.params().some((p) => p.nombre === 'idTabla');
      untracked(() => {
        const aMapa = (filas: Fila[]) => new Map(filas.map((x) => [Number(x['id']), Number(x['idPrograma'])] as [number, number]));
        if ((padre === 'idPlan' || filtraPlan) && !this.programaDePlan()) {
          this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((f) => {
            this.planesInfo.set(f);
            this.programaDePlan.set(aMapa(f));
          });
        } else if (padre === 'idOferta' && !this.programaDeOferta()) {
          this.api.listar('planificacion', '/api/v1/ofertas-academicas').subscribe((f) => this.programaDeOferta.set(aMapa(f)));
        } else if (padre === 'idGrupo' && !this.programaDeGrupo()) {
          this.api.listar('planificacion', '/api/v1/grupos').subscribe((f) => this.programaDeGrupo.set(aMapa(f)));
        }
        if (padre === 'idComision' && !this.programaDeComision()) {
          this.api.listar('curriculo', '/api/v1/comisiones-curriculares').subscribe((f) => this.programaDeComision.set(aMapa(f)));
        }
        // Tabla de convalidacion -> plan -> programa
        if ((padre === 'idTabla' || filtraTabla) && !this.programaDeTabla()) {
          forkJoin([this.api.listar('curriculo', '/api/v1/tablas-convalidacion'), this.api.listar('curriculo', '/api/v1/planes-estudio')]).subscribe(([tablas, planes]) => {
            const deplan = new Map(planes.map((p) => [Number(p['id']), Number(p['idPrograma'])]));
            this.programaDeTabla.set(new Map(tablas.map((t) => [Number(t['id']), deplan.get(Number(t['idPlan'])) ?? -1] as [number, number])));
          });
        }
      });
    });
    // Con un programa elegido, el filtro de plan arranca en el plan con el que ya se esta trabajando (o el vigente)
    effect(() => {
      const opciones = this.opcionesVisibles()['idPlan'];
      const filtros = this.filtros();
      untracked(() => {
        if (!opciones || opciones.length === 0 || filtros['idPlan'] || this.planManual() || Object.keys(this.fijos()).length) {
          return;
        }
        const validos = new Set(opciones.map((o) => String(o.valor)));
        let elegido = validos.has(this.api.plan()) ? this.api.plan() : '';
        if (!elegido) {
          const info = this.planesInfo().filter((p) => validos.has(String(p['id'])));
          const por = info.find((p) => p['estado'] === 'VIGENTE') ?? info.find((p) => p['estado'] === 'BORRADOR') ?? info[0];
          elegido = por ? String(por['id']) : String(opciones[0].valor);
        }
        this.filtros.update((f) => ({ ...f, idPlan: elegido }));
        this.api.fijarPlan(elegido);
        this.cargar();
      });
    });
    // Recarga al cambiar de recurso o de padre
    effect(() => {
      this.modulo();
      this.ruta();
      this.fijos();
      untracked(() => {
        this.busqueda.set('');
        this.planManual.set(false);
        this.filtros.set({});
        this.filas.set([]);
        this.cargarFiltros();
        this.cargar();
        // Precarga los planes si el formulario de alta los necesita (evita la espera al pulsar + Nuevo)
        const campos = this.recurso()?.crear?.campos ?? [];
        if ((campos.some((c) => FILTROS_PLAN.includes(c.nombre)) || campos.some((c) => c.nombre in this.fijos())) && this.planesInfo().length === 0) {
          this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((f) => this.planesInfo.set(f));
        }
      });
    });
  }

  private cargarFiltros(): void {
    this.opcionesFiltro.set({});
    for (const p of this.params()) {
      // "Filtrar por plan curso": lista de cursos de las mallas del programa (codigo y nombre), en vez de pedir el id
      if (p.nombre === 'idPlanCurso' && !this.api.referencia(this.modulo(), p.nombre)) {
        this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((planes) => {
          const programa = this.api.programa();
          const ops: Opcion[] = planes
            .filter((pl) => !programa || String(pl['idPrograma']) === programa)
            .flatMap((pl) =>
              ((pl['cursos'] as Fila[]) ?? [])
                .sort((a, b) => Number(a['ciclo']) - Number(b['ciclo']) || String(a['codigoCurso']).localeCompare(String(b['codigoCurso'])))
                .map((c) => ({ valor: c['id'], etiqueta: `${pl['version']} · Ciclo ${c['ciclo']} · ${c['codigoCurso']} · ${c['nombreCurso']}` })),
            );
          this.opcionesFiltro.update((x) => ({ ...x, [p.nombre]: ops }));
        });
        continue;
      }
      const refe = this.api.referencia(this.modulo(), p.nombre);
      if (refe) {
        this.api.opciones(refe).subscribe((o) => this.opcionesFiltro.update((x) => ({ ...x, [p.nombre]: o })));
      }
    }
  }

  cargar(): void {
    const r = this.recurso();
    if (!r?.listar) {
      return;
    }
    this.limite.set(FILAS_POR_TANDA);
    if (this.filtroFaltante()) {
      this.filas.set([]);
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.api.listar(this.modulo(), r.ruta, { ...this.filtros(), ...this.fijos() }).subscribe({
      next: (f) => {
        this.filas.set(f);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.filas.set([]);
        this.error.set(textoError(e));
      },
    });
  }

  filtrar(nombre: string, valor: string): void {
    if (nombre === 'idPlan') {
      this.planManual.set(valor === '');
      this.api.fijarPlan(valor || null);
    }
    this.filtros.update((f) => ({ ...f, [nombre]: valor }));
    this.cargar();
  }

  nuevo(): void {
    const r = this.recurso();
    if (!r?.crear) {
      return;
    }
    const sugeridos: Fila = { ...this.filtros(), ...this.fijos() };
    if (this.api.periodo()) {
      sugeridos['periodo'] = this.api.periodo();
    }
    if (this.api.programa() && r.crear.campos.some((c) => c.nombre === 'idPrograma') && !sugeridos['idPrograma']) {
      sugeridos['idPrograma'] = Number(this.api.programa());
    }
    const camposPlan = r.crear.campos.filter((c) => FILTROS_PLAN.includes(c.nombre));
    const construir = (planes: Fila[]) => {
      // Solo se ofrecen los planes del programa elegido; el plan del filtro (o el ultimo usado) llega preseleccionado y se puede cambiar
      const delPrograma = planes.filter((p) => !this.api.programa() || String(p['idPrograma']) === this.api.programa());
      const opcionesExtra: Record<string, Opcion[]> = {};
      const opcionesPlan: Opcion[] = delPrograma.map((p) => ({
        valor: p['id'],
        etiqueta: `${p['version']} · ${p['nombre']}${p['estado'] ? ' (' + String(p['estado']).replaceAll('_', ' ').toLowerCase() + ')' : ''}`,
      }));
      // Lo que fija la pantalla padre (el plan abierto en su detalle) no se vuelve a pedir
      const ocultos: Fila = {};
      let contexto = '';
      for (const c of r.crear!.campos) {
        const fijo = this.fijos()[c.nombre];
        if (fijo !== undefined && fijo !== null && fijo !== '') {
          ocultos[c.nombre] = fijo;
          delete sugeridos[c.nombre];
          if (c.nombre === 'idPlan') {
            const pl = planes.find((x) => String(x['id']) === String(fijo));
            contexto = pl ? `Plan: ${pl['version']} · ${pl['nombre']}` : '';
          }
        }
      }
      for (const c of camposPlan.filter((x) => !(x.nombre in ocultos))) {
        opcionesExtra[c.nombre] = opcionesPlan;
        const previo = c.nombre === 'idPlan' ? (this.filtros()['idPlan'] || this.api.plan()) : '';
        if (previo && opcionesPlan.some((o) => String(o.valor) === String(previo))) {
          sugeridos[c.nombre] = Number(previo);
        }
      }
      this.formulario.set({
        titulo: `Nuevo registro · ${this.etiqueta()}`,
        icono: '',
        boton: 'Registrar',
        campos: r.crear!.campos.filter((c) => !(c.nombre in ocultos)),
        inicial: sugeridos,
        ocultos,
        contexto,
        opcionesExtra,
        // Un curso nuevo del catalogo queda ligado al programa elegido en el contexto
        accion: (cuerpo) =>
          this.api.post(this.modulo(), r.ruta, r.ruta === '/api/v1/cursos-catalogo' && this.api.programa() ? { ...cuerpo, idPrograma: Number(this.api.programa()) } : cuerpo),
      });
    };
    const necesitaPlanes = camposPlan.length > 0 || r.crear.campos.some((c) => c.nombre in this.fijos());
    if (!necesitaPlanes) {
      construir([]);
    } else if (this.planesInfo().length > 0) {
      // Planes ya precargados: el formulario abre al instante
      construir(this.planesInfo());
    } else {
      this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe({ next: construir, error: () => construir([]) });
    }
  }

  editar(fila: Fila): void {
    const r = this.recurso();
    if (!r?.actualizar) {
      return;
    }
    this.formulario.set({
      titulo: `Editar · ${this.etiqueta()} #${fila['id']}`,
      icono: '',
      boton: 'Guardar cambios',
      campos: r.actualizar.campos,
      inicial: fila,
      accion: (cuerpo) => this.api.put(this.modulo(), `${r.ruta}/${fila['id']}`, cuerpo),
    });
  }

  ejecutar(op: Operacion, fila: Fila): void {
    const r = this.recurso();
    if (!r) {
      return;
    }
    const ruta = r.ruta + op.ruta.replace(/\{(\w+)\}/g, (_, v: string) => String(v === 'id' ? fila['id'] : (fila[v] ?? '')));
    const accion = (cuerpo: Fila) => (op.metodo === 'DELETE' ? this.api.delete(this.modulo(), ruta) : this.api.post(this.modulo(), ruta, cuerpo));
    if (op.campos.length === 0 && op.params.length === 0) {
      accion({}).subscribe({ next: () => this.listo(`${op.etiqueta}: operación realizada.`), error: (e) => this.error.set(textoError(e)) });
      return;
    }
    // Parametros de query (ej. modo del acta): se piden en el mismo formulario y viajan en la URL
    const conParams = (cuerpo: Fila) => {
      const qs = op.params.map((p) => `${p.nombre}=${encodeURIComponent(String(cuerpo[p.nombre] ?? ''))}`).join('&');
      const url = qs ? `${ruta}?${qs}` : ruta;
      const resto = Object.fromEntries(Object.entries(cuerpo).filter(([k]) => !op.params.some((p) => p.nombre === k)));
      return op.metodo === 'PUT' ? this.api.put(this.modulo(), url, resto) : this.api.post(this.modulo(), url, resto);
    };
    this.formulario.set({
      titulo: `${op.etiqueta} · ${this.etiqueta()} #${fila['id']}`,
      icono: '',
      boton: op.etiqueta,
      campos: [...op.params, ...op.campos],
      inicial: null,
      accion: op.params.length ? conParams : accion,
    });
  }

  confirmarEliminar(fila: Fila): void {
    const r = this.recurso();
    if (!r) {
      return;
    }
    this.api.delete(this.modulo(), `${r.ruta}/${fila['id']}`).subscribe({
      next: () => {
        this.porEliminar.set(null);
        this.listo('Registro eliminado.');
      },
      error: (e) => {
        this.porEliminar.set(null);
        this.error.set(textoError(e));
      },
    });
  }

  guardado(): void {
    this.formulario.set(null);
    this.listo('Cambios guardados correctamente.');
  }

  private listo(texto: string): void {
    this.api.invalidar(this.modulo(), this.ruta());
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3500);
    this.cargar();
  }

  texto(v: unknown): string {
    return textoCelda(v);
  }

  insignia(v: unknown) {
    return insigniaEstado(typeof v === 'boolean' ? (v ? 'SI' : 'NO') : v);
  }

  etiquetaFiltro(c: Campo): string {
    return humanizar(c.nombre);
  }
}

function capital(s: string): string {
  const t = s.toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Columnas visibles: id, codigo y nombre primero; sin listas ni el id del padre fijo; maximo 8. */
function columnasDe(filas: Fila[], recurso: Recurso | null, ocultas: string[]): Columna[] {
  const claves: string[] = [];
  for (const f of filas.slice(0, 20)) {
    for (const k of Object.keys(f)) {
      if (!claves.includes(k)) {
        claves.push(k);
      }
    }
  }
  if (claves.length === 0) {
    (recurso?.crear?.campos ?? []).forEach((c) => claves.push(c.nombre));
    claves.unshift('id');
  }
  const muestra = filas[0] ?? {};
  const visibles = claves.filter(
    (k) => !Array.isArray(muestra[k]) && k !== 'version' && !ocultas.includes(k) && !/^(fecha(Registro|Actualizacion|Creacion))$/.test(k),
  );
  const peso = (k: string) =>
    k === 'id' ? 0 : k === 'codigo' ? 1 : /^codigo/.test(k) ? 6 : /^(nombre|titulo|descripcion|denominacion)/.test(k) ? 2 : esCampoEstado(k) ? 9 : /^id[A-Z]/.test(k) ? 5 : 4;
  const orden = [...visibles].sort((a, b) => peso(a) - peso(b));
  const estado = orden.filter((k) => esCampoEstado(k));
  const resto = orden.filter((k) => !esCampoEstado(k)).slice(0, 8 - Math.min(estado.length, 2));
  return [...resto, ...estado.slice(0, 2)].map((k) => ({
    clave: k,
    titulo: k === 'id' ? 'N°' : humanizar(k).toUpperCase(),
    tipo: k === 'id' ? 'n' : /^codigo/.test(k) ? 'cod' : /^(nombre|titulo)/.test(k) ? 'fuerte' : esCampoEstado(k) ? 'estado' : 'normal',
  }));
}
