import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, shareReplay, catchError, forkJoin, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { MICROSERVICIOS } from '../features/microservicios/ms-catalogo';
import { Microservicio, Recurso } from '../features/microservicios/ms.model';
import { ClaveModulo, ClaveMs, ORIGENES_LOCALES, REF_PROGRAMA, REFERENCIAS, Referencia } from './modulos';

export type Fila = Record<string, unknown>;

// Listas grandes que se repiten entre pantallas: se guardan CACHE_MS (solo si se piden sin filtros)
const CACHE_MS = 20_000;
const LISTAS_CACHEADAS = [
  '/api/v1/planes-estudio',
  '/api/v1/grupos',
  '/api/v1/periodos-academicos',
  '/api/v1/ambientes',
  '/api/v1/cursos-catalogo',
  '/api/v1/asignaciones-docente',
  '/api/v1/tablas-convalidacion',
  '/api/v1/ofertas-academicas',
];

export interface Opcion {
  valor: unknown;
  etiqueta: string;
}

/** Acceso a los 3 microservicios del modulo por el Gateway (/ms/<servicio>/api/v1/...). */
@Injectable({ providedIn: 'root' })
export class AcademicoApi {
  private readonly http = inject(HttpClient);
  private readonly cacheOpciones = new Map<string, Observable<Opcion[]>>();
  private readonly cacheListas = new Map<string, { t: number; obs: Observable<Fila[]> }>();

  // Contexto global del LAMB real: Semestre + Programa (se recuerda entre visitas)
  readonly periodo = signal<string>(leer('lamb.ac.periodo'));
  readonly programa = signal<string>(leer('lamb.ac.programa'));
  // Plan de estudios con el que se esta trabajando: se elige una vez y se usa en todas las pantallas de estructura curricular
  readonly plan = signal<string>(leer('lamb.ac.plan'));

  fijarPlan(id: string | number | null): void {
    const valor = id === null || id === undefined ? '' : String(id);
    this.plan.set(valor);
    guardar('lamb.ac.plan', valor);
  }


  /** El periodo solo hace falta en los modulos que trabajan por semestre; el curriculo (planes, catalogo) no. */
  readonly requierePeriodo = signal(true);

  /** Crear registros exige tener elegido el programa y, si el modulo lo pide, el periodo. */
  readonly contextoListo = computed(() => !!this.programa() && (!this.requierePeriodo() || !!this.periodo()));
  readonly avisoContexto = 'Primero elige un Programa (y un Periodo, si el módulo lo pide) arriba';

  /** Borra el contexto al cerrar sesion (en la misma sesion se conserva aunque se deje un rato). */
  limpiarContexto(): void {
    this.periodo.set('');
    this.programa.set('');
    guardar('lamb.ac.periodo', '');
    guardar('lamb.ac.programa', '');
    this.fijarPlan(null);
  }

  elegirPeriodo(v: string): void {
    this.periodo.set(v);
    guardar('lamb.ac.periodo', v);
  }

  elegirPrograma(v: string): void {
    this.programa.set(v);
    guardar('lamb.ac.programa', v);
  }

  /** id del programa -> "Ing. de Sistemas · Facultad de Ingenieria" (de institucional). */
  nombresPrograma(): Observable<Map<string, string>> {
    return this.opciones(REF_PROGRAMA).pipe(map((ops) => new Map(ops.map((o) => [String(o.valor), o.etiqueta]))));
  }

  microservicio(clave: ClaveMs): Microservicio {
    const ms = MICROSERVICIOS.find((m) => m.clave === clave);
    if (!ms) {
      throw new Error(`Microservicio ${clave} no esta en el catalogo`);
    }
    return ms;
  }

  recurso(clave: ClaveMs, ruta: string): Recurso | undefined {
    return this.microservicio(clave).recursos.find((r) => r.ruta === ruta);
  }

  url(clave: ClaveMs, ruta: string): string {
    return `${environment.apiBaseUrl}${this.microservicio(clave).prefijo}${ruta}`;
  }

  get<T = unknown>(clave: ClaveMs, ruta: string, params: Fila = {}): Observable<T> {
    return this.http.get<T>(this.url(clave, ruta), { params: this.params(params) });
  }

  listar(clave: ClaveMs, ruta: string, params: Fila = {}): Observable<Fila[]> {
    const conFiltro = Object.values(params).some((v) => v !== undefined && v !== null && v !== '');
    if (conFiltro || !LISTAS_CACHEADAS.includes(ruta)) {
      return this.get<unknown>(clave, ruta, params).pipe(map(aLista));
    }
    // Planes, grupos, periodos...: varias pantallas los piden al cambiar de pestana; se reusan unos segundos
    const k = `${clave}:${ruta}`;
    const previo = this.cacheListas.get(k);
    if (previo && Date.now() - previo.t < CACHE_MS) {
      return previo.obs;
    }
    const obs = this.get<unknown>(clave, ruta).pipe(
      map(aLista),
      catchError((e) => {
        this.cacheListas.delete(k);
        throw e;
      }),
      shareReplay(1),
    );
    this.cacheListas.set(k, { t: Date.now(), obs });
    return obs;
  }

  /** Cualquier alta, cambio o baja deja sin efecto las listas guardadas. */
  private limpiarListas<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(tap(() => this.cacheListas.clear()));
  }

  post<T = unknown>(clave: ClaveModulo, ruta: string, cuerpo: unknown = {}): Observable<T> {
    return this.limpiarListas(this.http.post<T>(this.url(clave, ruta), cuerpo));
  }

  put<T = unknown>(clave: ClaveModulo, ruta: string, cuerpo: unknown): Observable<T> {
    return this.limpiarListas(this.http.put<T>(this.url(clave, ruta), cuerpo));
  }

  delete(clave: ClaveModulo, ruta: string): Observable<unknown> {
    return this.limpiarListas(this.http.delete(this.url(clave, ruta)));
  }

  /** Referencia de un campo id (idPlan, idGrupo...) para mostrarlo como lista desplegable. */
  referencia(modulo: ClaveModulo, campo: string): Referencia | undefined {
    return REFERENCIAS[modulo][campo];
  }

  /**
   * De donde sale un campo id: CRUD dueño y microservicio. Sirve para el aviso
   * "se jala de ..." en formularios y tablas (el id no lo inventa quien registra).
   */
  origen(modulo: ClaveModulo, campo: string): Origen | undefined {
    const local = ORIGENES_LOCALES[modulo][campo];
    if (local) {
      return { crud: local.crud, ms: nombreMs(local.ms), ruta: '', otroMs: local.ms !== modulo };
    }
    const refe = this.referencia(modulo, campo);
    if (!refe) {
      return undefined;
    }
    const crud = this.recurso(refe.ms, refe.ruta)?.etiqueta ?? humanizar(refe.ruta.split('/').pop() ?? campo);
    return { crud, ms: nombreMs(refe.ms), ruta: refe.ruta, otroMs: refe.ms !== modulo };
  }

  /** Opciones de una referencia; se cachean hasta que se invalida el recurso. */
  opciones(refe: Referencia): Observable<Opcion[]> {
    const clave = `${refe.ms}:${refe.ruta}`;
    let obs = this.cacheOpciones.get(clave);
    if (!obs) {
      const esPerfil = refe.ruta.endsWith('/perfiles-egreso') || refe.ruta.endsWith('/perfiles-ingreso');
      // Perfiles: etiqueta corta con el plan (año) al que pertenecen, en vez de la descripcion larga
      obs = (esPerfil
        ? forkJoin([this.listar(refe.ms, refe.ruta), this.listar(refe.ms, '/api/v1/planes-estudio')]).pipe(
            map(([perfiles, planes]) => {
              const porId = new Map(planes.map((p) => [Number(p['id']), p]));
              return perfiles.map((f) => {
                const plan = porId.get(Number(f['idPlan']));
                const desc = String(f['descripcion'] ?? '');
                const corta = desc.length > 45 ? desc.slice(0, 45).trimEnd() + '…' : desc;
                return { valor: f['id'], etiqueta: plan ? `Plan ${plan['version']} · ${corta}` : corta || `#${f['id']}` };
              });
            }),
          )
        : refe.ruta === '/api/v1/grupos'
          ? // Grupo de planificacion: "2026-2 · Lógica de Programación · 1A" (el codigo solo se repite entre cursos)
            this.listar(refe.ms, refe.ruta).pipe(
              map((filas) =>
                filas
                  .filter((f) => !this.programa() || String(f['idPrograma']) === this.programa())
                  // Ordenados por periodo, ciclo, grupo (1A, 1B...) y curso
                  .sort(
                    (a, b) =>
                      String(a['periodo']).localeCompare(String(b['periodo'])) ||
                      Number(a['ciclo'] ?? 0) - Number(b['ciclo'] ?? 0) ||
                      String(a['codigo']).localeCompare(String(b['codigo'])) ||
                      String((a['curso'] as Fila)?.['nombre']).localeCompare(String((b['curso'] as Fila)?.['nombre'])),
                  )
                  .map((f) => ({
                    valor: f['id'],
                    etiqueta: `${f['periodo'] ?? ''} · ${(f['curso'] as Fila)?.['nombre'] ?? ''} · ${f['codigo']}${f['estado'] === 'ANULADO' ? ' (anulado)' : ''}`,
                  })),
              ),
            )
          : this.listar(refe.ms, refe.ruta).pipe(map((filas) => filas.map((f) => ({ valor: f['id'], etiqueta: etiquetaFila(f) }))))
      ).pipe(
        catchError(() => of([])),
        // Una lista vacia (o un error) no se recuerda: si luego se cargan datos, la siguiente consulta los trae
        tap((o) => {
          if (o.length === 0) {
            this.cacheOpciones.delete(clave);
          }
        }),
        shareReplay(1),
      );
      this.cacheOpciones.set(clave, obs);
    }
    return obs;
  }

  invalidar(modulo: ClaveModulo, ruta: string): void {
    this.cacheOpciones.delete(`${modulo}:${ruta}`);
  }

  private params(valores: Fila): HttpParams {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(valores)) {
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, String(v));
      }
    }
    return params;
  }
}

export interface Origen {
  crud: string;
  // Nombre del microservicio dueño, p. ej. lamb-institucional-ms
  ms: string;
  ruta: string;
  // true si el CRUD es de otro microservicio (no del que guarda el registro)
  otroMs: boolean;
}

export function nombreMs(clave: ClaveMs): string {
  return `lamb-${clave}-ms`;
}

/** Texto corto del aviso: "# se jala de: Modalidades · lamb-curriculo-ms". */
export function textoOrigen(o: Origen): string {
  return `# se jala de: CRUD «${o.crud}» · ${o.ms}${o.otroMs ? ' (otro microservicio)' : ''}`;
}

function leer(clave: string): string {
  try {
    return sessionStorage.getItem(clave) ?? '';
  } catch {
    return '';
  }
}

function guardar(clave: string, valor: string): void {
  try {
    sessionStorage.setItem(clave, valor);
  } catch {
    // modo privado: el contexto solo dura la sesion
  }
}

export function aLista(respuesta: unknown): Fila[] {
  if (Array.isArray(respuesta)) {
    return respuesta as Fila[];
  }
  const pagina = respuesta as { content?: unknown };
  if (pagina && Array.isArray(pagina.content)) {
    return pagina.content as Fila[];
  }
  return respuesta && typeof respuesta === 'object' ? [respuesta as Fila] : [];
}

/** Texto corto para identificar una fila: codigo · nombre, o el primer campo descriptivo. */
export function etiquetaFila(f: Fila): string {
  const texto = (k: string) => (f[k] === null || f[k] === undefined || f[k] === '' ? null : String(f[k]));
  // Persona (lamb-personas-ms): apellidos, nombres - documento
  if (texto('apellidos') && texto('nombres')) {
    return `${texto('apellidos')}, ${texto('nombres')}${texto('numeroDocumento') ? ' – ' + texto('numeroDocumento') : ''}`;
  }
  // Programa (institucional): nombre · facultad
  const facultad = f['facultad'] as Fila | undefined;
  if (facultad && typeof facultad === 'object' && texto('nombre')) {
    return `${texto('nombre')} · ${facultad['nombre'] ?? ''}`;
  }
  const codigo = texto('codigo') ?? texto('codigoCurso') ?? texto('codigoGrupo');
  const nombre =
    texto('nombre') ?? texto('nombreCurso') ?? texto('titulo') ?? texto('descripcion') ?? texto('denominacion') ?? texto('periodo');
  const base = codigo && nombre && codigo !== nombre ? `${codigo} · ${nombre}` : (codigo ?? nombre);
  return base ? `${base}` : `#${f['id']}`;
}

/** idPlanCurso -> "Plan curso", fechaRegistro -> "Fecha registro". */
export function humanizar(nombre: string): string {
  const conEspacios = nombre
    .replace(/^id(?=[A-Z])/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1);
}

export interface Insignia {
  bg: string;
  color: string;
}

const VERDE: Insignia = { bg: '#DCFCE7', color: '#16A34A' };
const AMARILLO: Insignia = { bg: '#FEF3C7', color: '#B45309' };
const AZUL: Insignia = { bg: '#EFF6FF', color: '#1E3A8A' };
const ROJO: Insignia = { bg: '#FEE2E2', color: '#DC2626' };
const GRIS: Insignia = { bg: '#F1F5F9', color: '#64748B' };

/** Colores del diseño (ESTADO_COLOR) para estados del backend. */
export function insigniaEstado(valor: unknown): Insignia {
  const v = String(valor ?? '').toUpperCase();
  if (/^(ABIERT|VIGENTE|APROBAD|ACTIV|EN_CURSO|PRESENTE|JUSTIFICAD|HABILITAD|PUBLICAD|ACEPTAD|FIRMAD|SI$|TRUE)/.test(v)) {
    return VERDE;
  }
  if (/^(PENDIENTE|BORRADOR|EN_REVISION|REVISION|PROGRAMAD|TARDANZA|OBSERVAD|SOLICITAD|EN_PROCESO)/.test(v)) {
    return AMARILLO;
  }
  if (/^(CERRAD|FINALIZAD|CONCLUID|COMPLETAD|ATENDID|EN_EXTINCION)/.test(v)) {
    return AZUL;
  }
  if (/^(RECHAZAD|ANULAD|DEROGAD|INHABILITAD|FALTA|AUSENTE|CANCELAD|INACTIV|VENCID|NO$|FALSE)/.test(v)) {
    return ROJO;
  }
  return GRIS;
}

export function esCampoEstado(nombre: string): boolean {
  return /^(estado|activo|aprobad[oa]|vigente|habilitado|obligatorio)$/i.test(nombre);
}

export function textoCelda(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') {
    return '—';
  }
  if (typeof valor === 'boolean') {
    return valor ? 'Sí' : 'No';
  }
  if (Array.isArray(valor)) {
    return valor.length === 0 ? '—' : valor.every((v) => typeof v !== 'object') ? valor.join(', ') : `${valor.length} registro(s)`;
  }
  if (typeof valor === 'object') {
    return etiquetaFila(valor as Fila);
  }
  const s = String(valor);
  // 2026-10-16T01:48:30.65 -> 16/10/2026 01:48
  const fecha = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(s);
  if (fecha && s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) {
    return `${fecha[3]}/${fecha[2]}/${fecha[1]}${fecha[4] ? ` ${fecha[4]}:${fecha[5]}` : ''}`;
  }
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) {
    return s.slice(0, 5);
  }
  return s.replace(/_/g, ' ');
}
