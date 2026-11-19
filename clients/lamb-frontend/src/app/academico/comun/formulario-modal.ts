import { Component, OnInit, WritableSignal, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Campo } from '../../features/microservicios/ms.model';
import { convertir, valorParaInput } from '../../features/microservicios/ms-api.service';
import { AcademicoApi, Fila, Opcion, Origen, humanizar, textoOrigen } from '../academico-api';
import { ClaveModulo, REF_PERSONA, REF_PROGRAMA } from '../modulos';

/** Formulario del diseño (tarjeta "Datos generales", grilla de 4 columnas) dentro de un modal. */
@Component({
  selector: 'ac-formulario-modal',
  imports: [FormsModule],
  template: `
    <div class="ac-modal-back" (click)="cerrar.emit()">
      <div class="ac-modal" [class.chico]="campos().length <= 3" (click)="$event.stopPropagation()">
        <div class="ac-modal-head">
          <h3>{{ titulo() }}</h3>
          <button type="button" class="x" (click)="cerrar.emit()">✕</button>
        </div>
        <form class="ac-modal-body" (ngSubmit)="enviar()">
          <p class="ac-form-title">Datos generales</p>
          <p class="ac-form-sub">{{ subtitulo() || 'Complete los datos requeridos para registrar la información.' }}</p>
          @if (contexto()) {
            <p class="ac-form-sub" style="margin-top: -6px"><b>{{ contexto() }}</b></p>
          }

          @if (error()) {
            <div class="ac-alerta error">{{ error() }}</div>
          }

          @if (campos().length === 0) {
            <p style="font-size: 0.875rem; color: #64748b">Esta operación no requiere datos adicionales.</p>
          }

          <div class="ac-form-grid">
            @if (conSelectorPlan()) {
              <div class="ac-field">
                <label for="f-planElegido">Plan de estudios<span class="req">*</span></label>
                <select class="ac-input" id="f-planElegido" name="planElegido" [(ngModel)]="planElegido" (ngModelChange)="alCambiarPlan()" required>
                  <option value="">— Seleccione —</option>
                  @for (o of planesDelPrograma(); track o.valor) {
                    <option [value]="o.valor">{{ o.etiqueta }}</option>
                  }
                </select>
                <small class="ac-ayuda">Elige el plan: solo se muestran los cursos de su malla.</small>
              </div>
            }
            @for (c of campos(); track c.nombre) {
              <div class="ac-field" [class.total]="c.tipo === 'json' || c.tipo === 'textarea'" [class.ancho]="esAncho(c)" [style.display]="oculto(c) ? 'none' : null">
                <label [for]="'f-' + c.nombre">{{ etiqueta(c) }}@if (c.requerido) {<span class="req">*</span>}</label>
                @switch (c.tipo) {
                  @case ('select') {
                    <select class="ac-input" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" (ngModelChange)="alCambiarSelect(c.nombre)" [required]="c.requerido">
                      <option value="">— Seleccione —</option>
                      @for (o of c.opciones ?? []; track o) {
                        <option [value]="o">{{ o.replaceAll('_', ' ') }}</option>
                      }
                    </select>
                  }
                  @case ('checkbox') {
                    <label class="ac-check"><input type="checkbox" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" /> Sí</label>
                  }
                  @case ('textarea') {
                    <textarea class="ac-input" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [attr.maxlength]="c.max ?? null" [required]="c.requerido"></textarea>
                  }
                  @case ('json') {
                    @if (esListaElectivos(c)) {
                      @if (opcionesLista(c).length === 0) {
                        <p class="ac-ayuda" style="margin: 4px 0">
                          @if (!valores['idPlan']) {
                            Primero elige el plan.
                          } @else if (c.nombre === 'idCursosCatalogo') {
                            No quedan cursos libres del catálogo para este programa (todos ya están en la malla). Créalos antes en el catálogo de cursos.
                          } @else {
                            Este plan no tiene cursos de tipo Electivo libres (ya están todos en un grupo).
                          }
                        </p>
                      } @else {
                        @if (creditosRequeridos(c) !== null) {
                          <p class="ac-ayuda" style="margin: 0 0 6px">Todos los cursos del grupo deben tener los mismos créditos: solo se muestran los de {{ creditosRequeridos(c) }} créditos.</p>
                        }
                        <div class="ac-checks" style="display: grid; gap: 6px; max-height: 220px; overflow: auto; padding: 8px; border: 1px solid #e2e8f0; border-radius: 12px">
                          @for (e of opcionesLista(c); track e.id) {
                            <label class="ac-check" style="display: flex; gap: 8px; align-items: center">
                              <input type="checkbox" [name]="'el-' + e.id" [checked]="marcado(c.nombre, e.id)" (change)="alternar(c.nombre, e.id)" />
                              <span><b>{{ e.codigoCurso }}</b> · {{ e.nombreCurso }} <small style="color: #64748b">@if (e.ciclo) {· ciclo {{ e.ciclo }} }· {{ e.creditos }} cr</small></span>
                            </label>
                          }
                        </div>
                      }
                    } @else {
                    <textarea class="ac-input mono" rows="4" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [required]="c.requerido"></textarea>
                    }
                  }
                  @default {
                    @if (esAsignacionDeGrupo(c)) {
                      <select class="ac-input" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [required]="c.requerido" [disabled]="!valores['idGrupo']">
                        <option value="">{{ valores['idGrupo'] ? '— Seleccione —' : 'Primero elige el grupo' }}</option>
                        @for (o of asignacionesDelGrupo(); track o.valor) {
                          <option [value]="o.valor">{{ o.etiqueta }}</option>
                        }
                      </select>
                    } @else if (esEquivalencia(c)) {
                      <div style="display: grid; gap: 6px">
                        <select class="ac-input" [name]="'prog-' + c.nombre" [(ngModel)]="sel['prog' + lado(c)]" (ngModelChange)="alCambiarProgramaLado(c)">
                          <option value="">— Programa —</option>
                          @for (o of programas(); track o.valor) {
                            <option [value]="o.valor">{{ o.etiqueta }}</option>
                          }
                        </select>
                        <select class="ac-input" [name]="'plan-' + c.nombre" [(ngModel)]="sel['plan' + lado(c)]" (ngModelChange)="valores[c.nombre] = ''" [disabled]="!sel['prog' + lado(c)]">
                          <option value="">{{ sel['prog' + lado(c)] ? '— Plan —' : 'Primero elige el programa' }}</option>
                          @for (o of planesDelLado(c); track o.valor) {
                            <option [value]="o.valor">{{ o.etiqueta }}</option>
                          }
                        </select>
                        <select class="ac-input" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [required]="c.requerido" [disabled]="!sel['plan' + lado(c)]">
                          <option value="">{{ sel['plan' + lado(c)] ? '— Curso —' : 'Primero elige el plan' }}</option>
                          @for (o of cursosDelLado(c); track o.valor) {
                            <option [value]="o.valor">{{ o.etiqueta }}</option>
                          }
                        </select>
                      </div>
                    } @else if (esTablaDelPlan(c)) {
                      <select class="ac-input" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [required]="c.requerido" [disabled]="!planElegido">
                        <option value="">{{ planElegido ? '— Seleccione —' : 'Primero elige el plan de estudios' }}</option>
                        @for (o of tablasDelPlanElegido(); track o.valor) {
                          <option [value]="o.valor">{{ o.etiqueta }}</option>
                        }
                      </select>
                      @if (planElegido && tablasDelPlanElegido().length === 0) {
                        <small class="ac-origen vacio">Este plan no tiene tablas de convalidación: créala antes en «Tablas de convalidación».</small>
                      }
                    } @else if (esCursoDePlan(c)) {
                      <select class="ac-input" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [required]="c.requerido" [disabled]="!planElegido">
                        <option value="">{{ planElegido ? '— Seleccione —' : 'Primero elige el plan de estudios' }}</option>
                        @for (o of cursosDelPlanElegido(c.nombre); track o.valor) {
                          <option [value]="o.valor">{{ o.etiqueta }}</option>
                        }
                      </select>
                    } @else if (esCompetenciaPorTipo(c)) {
                      <select class="ac-input" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [required]="c.requerido" [disabled]="!valores['tipoCompetencia']">
                        <option value="">{{ valores['tipoCompetencia'] ? '— Seleccione —' : 'Primero elige el tipo de competencia' }}</option>
                        @for (o of competenciasDelTipo(); track o.valor) {
                          <option [value]="o.valor">{{ o.etiqueta }}</option>
                        }
                      </select>
                    } @else if (opciones[c.nombre]) {
                      <select class="ac-input" [id]="'f-' + c.nombre" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [required]="c.requerido">
                        <option value="">— Seleccione —</option>
                        @for (o of opciones[c.nombre](); track o.valor) {
                          <option [value]="o.valor">{{ o.etiqueta }}</option>
                        }
                      </select>
                    } @else {
                      <input
                        class="ac-input"
                        [id]="'f-' + c.nombre"
                        [name]="c.nombre"
                        [type]="tipoInput(c)"
                        [step]="c.tipo === 'decimal' ? '0.01' : c.tipo === 'number' ? '1' : null"
                        [attr.maxlength]="c.max ?? null"
                        [(ngModel)]="valores[c.nombre]"
                        [required]="c.requerido"
                        [placeholder]="c.tipo === 'number' && c.nombre.startsWith('id') ? 'Id ' + etiqueta(c).toLowerCase() : ''"
                      />
                    }
                  }
                }
                @if (origenes[c.nombre]; as o) {
                  <small class="ac-origen" [title]="o.ruta ? 'GET ' + o.ruta : ''">{{ textoOrigen(o) }}</small>
                  @if (vacios()[c.nombre]) {
                    <small class="ac-origen vacio">No llegaron registros de ese CRUD (está vacío o su microservicio está apagado): escribe el id a mano.</small>
                  }
                }
                @if (ayudas()[c.nombre]; as a) {
                  <small class="ac-ayuda">{{ a }}</small>
                }
              </div>
            }
          </div>

          <div class="ac-form-actions">
            <button type="button" class="ac-btn-out" (click)="cerrar.emit()">Cancelar</button>
            <button type="submit" class="ac-btn-navy" [disabled]="guardando()">{{ guardando() ? 'Guardando…' : textoBoton() }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormularioModal implements OnInit {
  private readonly api = inject(AcademicoApi);

  readonly modulo = input.required<ClaveModulo>();
  readonly campos = input.required<Campo[]>();
  readonly titulo = input('Registrar');
  readonly subtitulo = input('');
  readonly icono = input('');
  readonly textoBoton = input('Guardar');
  readonly inicial = input<Fila | null>(null);
  // Valores ya elegidos antes (p. ej. el plan): no se vuelven a pedir, solo se muestran como contexto y se envian
  readonly ocultos = input<Fila>({});
  readonly contexto = input('');
  // Valores fijos (por ejemplo el periodo o el filtro activo) para prellenar al crear
  readonly sugeridos = input<Fila>({});
  // Listas propias de la pagina para campos que no estan en REFERENCIAS
  readonly opcionesExtra = input<Record<string, Opcion[]>>({});
  // Texto de ayuda por campo (que poner en version, modalidad...)
  readonly ayudas = input<Record<string, string>>({});
  // La pagina hace la peticion: recibe el cuerpo ya convertido y devuelve el observable
  readonly accion = input.required<(cuerpo: Fila) => Observable<unknown>>();

  readonly guardado = output<unknown>();
  readonly cerrar = output<void>();

  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly vacios = signal<Record<string, boolean>>({});
  // Grupos de electivos: cursos de la malla con tipo Electivo y los que ya estan en algun grupo
  private readonly planesMalla = signal<Fila[]>([]);
  private readonly tablas = signal<Fila[]>([]);
  private readonly universidades = signal<Fila[]>([]);
  private readonly gruposUsados = signal<Fila[]>([]);
  private readonly catalogo = signal<Fila[]>([]);
  readonly textoOrigen = textoOrigen;
  valores: Fila = {};
  opciones: Record<string, WritableSignal<Opcion[]>> = {};
  origenes: Record<string, Origen> = {};

  // Dimensiones de competencia: la lista de competencias depende del tipo elegido
  private readonly generales = signal<Fila[]>([]);
  private readonly especificas = signal<Fila[]>([]);
  private readonly perfilesEgreso = signal<Fila[]>([]);

  // Campos que apuntan a un curso de la malla: se eligen dentro de un plan (selector que no se envia al servidor)
  planElegido = '';

  conSelectorPlan(): boolean {
    return this.campos().some((c) => c.nombre === 'idPlanCurso') && !this.campos().some((c) => c.nombre === 'idPlan');
  }

  // Horario: el docente del bloque sale de las asignaciones del grupo elegido (nombre desde lamb-personas-ms)
  private readonly asignaciones = signal<Fila[]>([]);
  private readonly nombresPersona = signal<Map<string, string>>(new Map());

  esAsignacionDeGrupo(c: Campo): boolean {
    return c.nombre === 'idAsignacionDocente' && this.campos().some((x) => x.nombre === 'idGrupo');
  }

  asignacionesDelGrupo(): Opcion[] {
    const grupo = String(this.valores['idGrupo'] ?? '');
    return this.asignaciones()
      .filter((a) => String(a['idGrupo']) === grupo)
      .map((a) => {
        const rol = String(a['rol'] ?? '').toLowerCase();
        const nombre = this.nombresPersona().get(String(a['idDocente'])) ?? `Docente #${a['idDocente']}`;
        return { valor: a['id'], etiqueta: `${nombre} · ${rol.charAt(0).toUpperCase() + rol.slice(1)}` };
      });
  }

  /** Modulo: solo aplica a cursos modulares; si el periodo no tiene modulos el campo no se muestra. */
  oculto(c: Campo): boolean {
    return c.nombre === 'idModulo' && !!this.vacios()['idModulo'] && !this.valores['idModulo'];
  }

  // Equivalencia entre planes: cada lado (origen / destino) elige programa, plan y curso; pueden ser de programas distintos
  sel: Record<string, string> = {};
  readonly programas = signal<Opcion[]>([]);

  esEquivalencia(c: Campo): boolean {
    return c.nombre === 'idPlanCursoOrigen' || c.nombre === 'idPlanCursoDestino';
  }

  lado(c: Campo): 'Origen' | 'Destino' {
    return c.nombre.endsWith('Origen') ? 'Origen' : 'Destino';
  }

  planesDelLado(c: Campo): Opcion[] {
    const l = this.lado(c);
    const otro = this.sel['plan' + (l === 'Origen' ? 'Destino' : 'Origen')];
    return this.planesMalla()
      .filter((p) => String(p['idPrograma']) === this.sel['prog' + l] && String(p['id']) !== otro)
      .map((p) => ({ valor: p['id'], etiqueta: `${p['version']} · ${p['nombre']}` }));
  }

  cursosDelLado(c: Campo): Opcion[] {
    const plan = this.planesMalla().find((p) => String(p['id']) === this.sel['plan' + this.lado(c)]);
    return ((plan?.['cursos'] as Fila[]) ?? [])
      .slice()
      .sort((a, b) => Number(a['ciclo']) - Number(b['ciclo']) || String(a['codigoCurso']).localeCompare(String(b['codigoCurso'])))
      .map((x) => ({ valor: x['id'], etiqueta: `Ciclo ${x['ciclo']} · ${x['codigoCurso']} · ${x['nombreCurso']}` }));
  }

  alCambiarProgramaLado(c: Campo): void {
    this.sel['plan' + this.lado(c)] = '';
    this.valores[c.nombre] = '';
  }

  /** Al editar deduce programa y plan de cada curso; al crear arranca en el programa del contexto. */
  private elegirLadosIniciales(): void {
    for (const campo of ['idPlanCursoOrigen', 'idPlanCursoDestino']) {
      const l = campo.endsWith('Origen') ? 'Origen' : 'Destino';
      const id = Number(this.valores[campo]);
      const plan = id ? this.planesMalla().find((p) => ((p['cursos'] as Fila[]) ?? []).some((x) => Number(x['id']) === id)) : undefined;
      this.sel['prog' + l] = plan ? String(plan['idPrograma']) : (this.sel['prog' + l] || this.api.programa());
      this.sel['plan' + l] = plan ? String(plan['id']) : (this.sel['plan' + l] ?? '');
    }
  }

  esTablaDelPlan(c: Campo): boolean {
    return this.conSelectorPlan() && c.nombre === 'idTabla';
  }

  /** Tablas de convalidacion del plan elegido, con su universidad: "UNAP · Convalidacion UNAP a Sistemas 2026". */
  tablasDelPlanElegido(): Opcion[] {
    const universidades = new Map(this.universidades().map((u) => [Number(u['id']), String(u['codigo'])]));
    return this.tablas()
      .filter((t) => String(t['idPlan']) === String(this.planElegido))
      .map((t) => ({ valor: t['id'], etiqueta: `${universidades.get(Number(t['idUniversidad'])) ?? ''} · ${t['nombre']}`.replace(/^ · /, '') }));
  }

  esCursoDePlan(c: Campo): boolean {
    return this.conSelectorPlan() && (c.nombre === 'idPlanCurso' || c.nombre === 'idCursoRequisito');
  }

  planesDelPrograma(): Opcion[] {
    const programa = String(this.api.programa());
    return this.planesMalla()
      .filter((p) => !programa || String(p['idPrograma']) === programa)
      .map((p) => ({ valor: p['id'], etiqueta: `${p['version']} · ${p['nombre']}${p['estado'] ? ' (' + String(p['estado']).replaceAll('_', ' ').toLowerCase() + ')' : ''}` }));
  }

  cursosDelPlanElegido(nombre: string): Opcion[] {
    const plan = this.planesMalla().find((p) => String(p['id']) === String(this.planElegido));
    const propio = nombre === 'idCursoRequisito' ? String(this.valores['idPlanCurso'] ?? '') : '';
    return ((plan?.['cursos'] as Fila[]) ?? [])
      .filter((c) => !propio || String(c['id']) !== propio)
      .sort((a, b) => Number(a['ciclo']) - Number(b['ciclo']) || String(a['codigoCurso']).localeCompare(String(b['codigoCurso'])))
      .map((c) => ({ valor: c['id'], etiqueta: `Ciclo ${c['ciclo']} · ${c['codigoCurso']} · ${c['nombreCurso']}` }));
  }

  alCambiarPlan(): void {
    this.valores['idPlanCurso'] = '';
    this.valores['idCursoRequisito'] = '';
    this.valores['idTabla'] = '';
  }

  /** Al editar: deduce el plan del curso ya guardado; al crear: el plan con el que se trabaja (o el unico del programa). */
  private elegirPlanInicial(): void {
    if (this.planElegido) {
      return;
    }
    const actual = Number(this.valores['idPlanCurso']);
    const deCurso = actual ? this.planesMalla().find((p) => ((p['cursos'] as Fila[]) ?? []).some((c) => Number(c['id']) === actual)) : undefined;
    const opciones = this.planesDelPrograma();
    const trabajo = opciones.find((o) => String(o.valor) === this.api.plan());
    const elegido = deCurso ? { valor: deCurso['id'] } : (trabajo ?? (opciones.length === 1 ? opciones[0] : undefined));
    this.planElegido = elegido ? String(elegido.valor) : '';
  }

  esCompetenciaPorTipo(c: Campo): boolean {
    return c.nombre === 'idCompetencia' && this.campos().some((x) => x.nombre === 'tipoCompetencia');
  }

  alCambiarSelect(nombre: string): void {
    if (nombre === 'tipoCompetencia') {
      this.valores['idCompetencia'] = '';
    }
  }

  /** Competencias generales (institucionales) o especificas del programa en contexto, segun el tipo elegido. */
  competenciasDelTipo(): Opcion[] {
    const tipo = this.valores['tipoCompetencia'];
    if (tipo === 'GENERAL') {
      return this.generales().map((g) => ({ valor: g['id'], etiqueta: `${g['codigo']} · ${g['nombre']}` }));
    }
    if (tipo !== 'ESPECIFICA') {
      return [];
    }
    const programa = String(this.api.programa());
    const planes = new Map(this.planesMalla().map((p) => [Number(p['id']), p]));
    const perfiles = new Map(this.perfilesEgreso().map((p) => [Number(p['id']), p]));
    return this.especificas()
      .filter((e) => {
        const plan = planes.get(Number(perfiles.get(Number(e['idPerfilEgreso']))?.['idPlan']));
        return !programa || !plan || String(plan['idPrograma']) === programa;
      })
      .map((e) => {
        const plan = planes.get(Number(perfiles.get(Number(e['idPerfilEgreso']))?.['idPlan']));
        return { valor: e['id'], etiqueta: `${e['codigo']} · ${e['nombre']}${plan ? ' · plan ' + plan['version'] : ''}` };
      });
  }

  ngOnInit(): void {
    if (this.campos().some((c) => this.esAsignacionDeGrupo(c))) {
      this.api.listar('planificacion', '/api/v1/asignaciones-docente').subscribe((a) => this.asignaciones.set(a));
      // "Apellidos, Nombres – DNI": en el horario basta el nombre
      this.api.opciones(REF_PERSONA).subscribe((o) => this.nombresPersona.set(new Map(o.map((x) => [String(x.valor), x.etiqueta.replace(/ – .*$/, '')]))));
    }
    if (this.campos().some((c) => this.esEquivalencia(c))) {
      this.api.opciones(REF_PROGRAMA).subscribe((o) => this.programas.set(o));
      this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((p) => {
        this.planesMalla.set(p);
        this.elegirLadosIniciales();
      });
    }
    if (this.conSelectorPlan() && this.campos().some((c) => c.nombre === 'idTabla')) {
      this.api.listar('curriculo', '/api/v1/tablas-convalidacion').subscribe((t) => {
        this.tablas.set(t);
        this.elegirPlanInicial();
      });
      this.api.listar('curriculo', '/api/v1/universidades-origen').subscribe((u) => this.universidades.set(u));
    }
    if (this.conSelectorPlan()) {
      this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((p) => {
        this.planesMalla.set(p);
        this.elegirPlanInicial();
      });
    }
    if (this.campos().some((c) => this.esCompetenciaPorTipo(c))) {
      this.api.listar('curriculo', '/api/v1/competencias-generales').subscribe((l) => this.generales.set(l));
      this.api.listar('curriculo', '/api/v1/competencias-especificas').subscribe((l) => this.especificas.set(l));
      this.api.listar('curriculo', '/api/v1/perfiles-egreso').subscribe((l) => this.perfilesEgreso.set(l));
      this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((p) => this.planesMalla.set(p));
    }
    if (this.campos().some((c) => this.esListaElectivos(c))) {
      this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((p) => this.planesMalla.set(p));
      this.api.listar('curriculo', '/api/v1/grupos-electivos').subscribe((g) => this.gruposUsados.set(g));
      if (this.campos().some((c) => c.nombre === 'idCursosCatalogo')) {
        this.api.listar('curriculo', '/api/v1/cursos-catalogo').subscribe((c) => this.catalogo.set(c));
      }
    }
    const inicial = this.inicial();
    Object.assign(this.valores, this.ocultos());
    for (const c of this.campos()) {
      const base = inicial ? inicial[c.nombre] : this.sugeridos()[c.nombre];
      this.valores[c.nombre] = valorParaInput(c, base);
      // La lista de electivos arranca vacia (o con los cursos del grupo que se edita), nunca con el ejemplo "[1]"
      if (this.esListaElectivos(c)) {
        this.valores[c.nombre] = Array.isArray(base) ? JSON.stringify(base) : '[]';
      }
      const origen = this.api.origen(this.modulo(), c.nombre);
      if (origen) {
        this.origenes[c.nombre] = origen;
      }
      // Cursos de la malla: salen del plan elegido arriba, no de una referencia suelta
      if (this.esCursoDePlan(c) || this.esTablaDelPlan(c) || this.esEquivalencia(c) || this.esAsignacionDeGrupo(c)) {
        continue;
      }
      const extra = this.opcionesExtra()[c.nombre];
      if (extra) {
        this.opciones[c.nombre] = signal(extra);
        continue;
      }
      const refe = c.tipo === 'number' ? this.api.referencia(this.modulo(), c.nombre) : undefined;
      if (refe) {
        const sig = signal<Opcion[]>([]);
        this.opciones[c.nombre] = sig;
        this.api.opciones(refe).subscribe((o) => {
          // Sin datos en la referencia: queda el campo numerico libre
          if (o.length === 0) {
            delete this.opciones[c.nombre];
            this.vacios.update((v) => ({ ...v, [c.nombre]: true }));
          }
          sig.set(o);
        });
      }
    }
  }

  esListaElectivos(c: Campo): boolean {
    return (c.nombre === 'idPlanCursos' || c.nombre === 'idCursosCatalogo') && c.tipo === 'json';
  }

  /** Casillas de la lista: electivos ya en la malla (editar grupo) o cursos libres del catalogo (grupo nuevo). */
  opcionesLista(c: Campo): { id: number; codigoCurso: string; nombreCurso: string; ciclo?: number; creditos: number }[] {
    if (c.nombre !== 'idCursosCatalogo') {
      return this.electivosDelPlan();
    }
    // Una vez elegido el primer curso, solo se ofrecen los que valen sus mismos creditos (los ya marcados siempre se ven)
    const requeridos = this.creditosRequeridos(c);
    return this.cursosLibresDelPlan().filter((e) => requeridos === null || e.creditos === requeridos || this.marcado(c.nombre, e.id));
  }

  /** Creditos del primer curso marcado: todos los cursos del grupo de electivos deben valer lo mismo. */
  creditosRequeridos(c: Campo): number | null {
    if (c.nombre !== 'idCursosCatalogo') {
      return null;
    }
    const primero = this.elegidos(c.nombre)[0];
    const curso = primero === undefined ? undefined : this.catalogo().find((x) => Number(x['id']) === primero);
    return curso ? Number(curso['creditos']) : null;
  }

  /** Cursos del catalogo del programa del plan elegido que todavia no estan en su malla (libres para ser electivos). */
  cursosLibresDelPlan(): { id: number; codigoCurso: string; nombreCurso: string; creditos: number }[] {
    const idPlan = Number(this.valores['idPlan']);
    const plan = this.planesMalla().find((p) => Number(p['id']) === idPlan);
    if (!plan) {
      return [];
    }
    const programa = plan['idPrograma'];
    const delPrograma = new Set<number>();
    this.planesMalla()
      .filter((p) => p['idPrograma'] === programa)
      .forEach((p) => ((p['cursos'] as Fila[]) ?? []).forEach((c) => delPrograma.add(Number(c['idCursoCatalogo']))));
    this.catalogo().filter((c) => c['idPrograma'] === programa).forEach((c) => delPrograma.add(Number(c['id'])));
    const enElPlan = new Set(((plan['cursos'] as Fila[]) ?? []).map((c) => Number(c['idCursoCatalogo'])));
    // Tomados por otro grupo del plan (los del grupo que se edita siguen disponibles)
    const propio = this.inicial()?.['id'];
    const propios = new Set(((this.inicial()?.['idCursosCatalogo'] as number[]) ?? []).map(Number));
    const tomados = new Set<number>();
    this.gruposUsados()
      .filter((g) => Number(g['idPlan']) === idPlan && g['id'] !== propio)
      .forEach((g) => ((g['idCursosCatalogo'] as number[]) ?? []).forEach((id) => tomados.add(Number(id))));
    return this.catalogo()
      .filter((c) => delPrograma.has(Number(c['id'])) && (propios.has(Number(c['id'])) || (!enElPlan.has(Number(c['id'])) && !tomados.has(Number(c['id'])))))
      .map((c) => ({ id: Number(c['id']), codigoCurso: String(c['codigo']), nombreCurso: String(c['nombre']), creditos: Number(c['creditos']) }))
      .sort((a, b) => a.codigoCurso.localeCompare(b.codigoCurso));
  }

  /** Cursos tipo Electivo del plan elegido que aun no estan en otro grupo (los del grupo que se edita si). */
  electivosDelPlan(): { id: number; codigoCurso: string; nombreCurso: string; ciclo: number; creditos: number }[] {
    const idPlan = Number(this.valores['idPlan']);
    const plan = this.planesMalla().find((p) => Number(p['id']) === idPlan);
    if (!plan) {
      return [];
    }
    const propio = this.inicial()?.['id'];
    const usados = new Set<number>();
    this.gruposUsados()
      .filter((g) => Number(g['idPlan']) === idPlan && g['id'] !== propio)
      .forEach((g) => ((g['idPlanCursos'] as number[]) ?? []).forEach((id) => usados.add(Number(id))));
    return ((plan['cursos'] as Fila[]) ?? [])
      .filter((c) => String(c['tipo']) === 'ELECTIVO' && !usados.has(Number(c['id'])))
      .map((c) => ({ id: Number(c['id']), codigoCurso: String(c['codigoCurso']), nombreCurso: String(c['nombreCurso']), ciclo: Number(c['ciclo']), creditos: Number(c['creditos']) }))
      .sort((a, b) => a.ciclo - b.ciclo || a.codigoCurso.localeCompare(b.codigoCurso));
  }

  private elegidos(nombre: string): number[] {
    try {
      const v = JSON.parse(String(this.valores[nombre] ?? '[]'));
      return Array.isArray(v) ? v.map(Number) : [];
    } catch {
      return [];
    }
  }

  marcado(nombre: string, id: number): boolean {
    return this.elegidos(nombre).includes(id);
  }

  alternar(nombre: string, id: number): void {
    const actual = this.elegidos(nombre);
    this.valores[nombre] = JSON.stringify(actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]);
  }

  etiqueta(c: Campo): string {
    return c.nombre.startsWith('id') && c.nombre.length > 2 ? humanizar(c.nombre) : c.etiqueta || humanizar(c.nombre);
  }

  esAncho(c: Campo): boolean {
    return c.tipo === 'text' && (c.max ?? 0) > 120;
  }

  tipoInput(c: Campo): string {
    switch (c.tipo) {
      case 'number':
      case 'decimal':
        return 'number';
      case 'date':
        return 'date';
      case 'datetime':
        return 'datetime-local';
      case 'time':
        return 'time';
      case 'email':
        return 'email';
      default:
        return 'text';
    }
  }

  enviar(): void {
    this.error.set(null);
    const cuerpo: Fila = {};
    try {
      for (const c of this.campos()) {
        const v = this.valores[c.nombre];
        if (c.requerido && c.tipo !== 'checkbox' && (v === '' || v === null || v === undefined)) {
          throw new Error(`El campo "${this.etiqueta(c)}" es obligatorio.`);
        }
        if (this.esListaElectivos(c)) {
          const elegidos = this.elegidos(c.nombre);
          if (elegidos.length === 0) {
            throw new Error('Marca al menos un curso electivo del plan.');
          }
          const cantidad = Number(this.valores['cantidadElegir']);
          if (cantidad > elegidos.length) {
            throw new Error(`Pides elegir ${cantidad} cursos, pero marcaste ${elegidos.length}. Marca más cursos o baja la cantidad a elegir.`);
          }
        }
        cuerpo[c.nombre] = convertir(c, v);
      }
    } catch (e) {
      this.error.set(e instanceof SyntaxError ? 'Hay un campo JSON con formato no válido.' : (e as Error).message);
      return;
    }
    Object.assign(cuerpo, this.ocultos());
    this.guardando.set(true);
    this.accion()(cuerpo).subscribe({
      next: (r) => {
        this.guardando.set(false);
        this.guardado.emit(r);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(textoError(err));
      },
    });
  }
}

export function textoError(err: unknown): string {
  const e = err as { status?: number; error?: { message?: string; detail?: string } | string };
  const cuerpo = e?.error;
  const motivo = typeof cuerpo === 'string' ? cuerpo : (cuerpo?.message ?? cuerpo?.detail);
  switch (e?.status) {
    case 0:
      return 'No hay conexión con el servidor (Gateway en localhost:18080).';
    case 401:
      return 'La sesión expiró: vuelve a iniciar sesión.';
    case 403:
      return 'Tu rol no tiene permiso para esta operación.';
    case 503:
      return 'El microservicio no está disponible en este momento.';
  }
  return motivo ? String(motivo) : `Error inesperado (HTTP ${e?.status ?? '?'})`;
}
