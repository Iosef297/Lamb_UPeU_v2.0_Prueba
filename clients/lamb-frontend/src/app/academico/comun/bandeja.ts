import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { AcademicoApi, Fila, humanizar, insigniaEstado, textoCelda } from '../academico-api';
import { ClaveModulo, REF_PERSONA, buscarModulo } from '../modulos';
import { DetalleModal } from './detalle-modal';
import { textoError } from './formulario-modal';
import { SesionUi } from './sesion-ui';

interface TipoSolicitud {
  ruta: string;
  etiqueta: string;
  // accion: POST /{id}/responder · respuesta: se registra en respuestas-solicitud-apertura
  responde: 'accion' | 'respuesta';
}

const TIPOS: Record<ClaveModulo, TipoSolicitud[]> = {
  curriculo: [{ ruta: '/api/v1/solicitudes-modificacion-curricular', etiqueta: 'Modificación curricular', responde: 'accion' }],
  planificacion: [
    { ruta: '/api/v1/solicitudes-apertura-grupo', etiqueta: 'Apertura de grupo', responde: 'accion' },
    { ruta: '/api/v1/solicitudes-cambio-aula', etiqueta: 'Cambio de aula', responde: 'accion' },
    { ruta: '/api/v1/solicitudes-cambio-docente', etiqueta: 'Cambio de docente', responde: 'accion' },
    { ruta: '/api/v1/solicitudes-cambio-horario', etiqueta: 'Cambio de horario', responde: 'accion' },
    { ruta: '/api/v1/solicitudes-cierre-fusion', etiqueta: 'Cierre / fusión', responde: 'accion' },
    { ruta: '/api/v1/solicitudes-grupo-equivalente', etiqueta: 'Grupo equivalente', responde: 'accion' },
  ],
  evaluacion: [
    { ruta: '/api/v1/actas-rectificacion', etiqueta: 'Rectificación de acta', responde: 'accion' },
    { ruta: '/api/v1/justificaciones-inasistencia', etiqueta: 'Justificación de inasistencia', responde: 'accion' },
    { ruta: '/api/v1/solicitudes-apertura-notas', etiqueta: 'Apertura de notas', responde: 'respuesta' },
  ],
};

// Campos que no aportan en la tabla de la bandeja
const OCULTOS = /^(id|estado|version|observacionRespuesta|idRespondidoPor|fechaRespuesta)$/;

/** Bandeja de solicitudes del modulo: pestaña por tipo, filtro por estado y Aprobar / Rechazar. */
@Component({
  selector: 'ac-bandeja',
  imports: [FormsModule, DetalleModal],
  templateUrl: './bandeja.html',
})
export class Bandeja {
  private readonly api = inject(AcademicoApi);
  private readonly route = inject(ActivatedRoute);
  readonly sesion = inject(SesionUi);

  readonly modulo = signal<ClaveModulo | null>(null);
  readonly tipos = signal<TipoSolicitud[]>([]);
  readonly activo = signal<TipoSolicitud | null>(null);
  readonly datos = signal<Record<string, Fila[]>>({});
  readonly estado = signal<string>('PENDIENTE');
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly detalle = signal<Fila | null>(null);
  readonly respondiendo = signal<{ fila: Fila; aprobada: boolean } | null>(null);
  observacion = '';

  // Responder solicitudes: solo ADMIN y COORDINADOR (guia §8.10)
  readonly puedeResponder = computed(() => this.sesion.puedeEscribir(['ADMIN', 'COORDINADOR']));

  // Planes (para mostrar la version y limitar al programa elegido) y nombres de las personas
  private readonly planes = signal<Fila[]>([]);
  private readonly personas = signal<Map<string, string>>(new Map());

  /** Con un programa elegido, la bandeja de currículo solo muestra solicitudes de planes de ese programa. */
  private delPrograma(f: Fila): boolean {
    if (this.modulo() !== 'curriculo' || !this.api.programa() || !('idPlan' in f)) {
      return true;
    }
    const plan = this.planes().find((p) => String(p['id']) === String(f['idPlan']));
    return !!plan && String(plan['idPrograma']) === this.api.programa();
  }

  readonly filas = computed(() => {
    const a = this.activo();
    const todas = (a ? (this.datos()[a.ruta] ?? []) : []).filter((f) => this.delPrograma(f));
    return this.estado() ? todas.filter((f) => f['estado'] === this.estado()) : todas;
  });

  /** Mensaje de la ventana de respuesta: en currículo aprobar solo registra la respuesta, no cambia la malla. */
  readonly textoAprobar = computed(() =>
    this.modulo() === 'curriculo'
      ? 'Al aprobar queda registrada la respuesta. El cambio en la malla se hace después en Plan de estudios. Esta respuesta no se puede deshacer.'
      : 'Al aprobar se aplicará el cambio solicitado. Esta respuesta no se puede deshacer.',
  );
  readonly subtitulo = computed(() =>
    this.modulo() === 'curriculo'
      ? 'Solicitudes de cambio de los planes de estudio: la comisión las aprueba o las rechaza'
      : 'Al aprobar, el sistema aplica el cambio (aula, docente, horario, nota, asistencia…)',
  );

  readonly columnas = computed(() => {
    const muestra = this.filas()[0] ?? (this.activo() ? this.datos()[this.activo()!.ruta]?.[0] : undefined) ?? {};
    return Object.keys(muestra)
      .filter((k) => !OCULTOS.test(k) && !Array.isArray(muestra[k]))
      .slice(0, 6);
  });

  constructor() {
    this.route.parent!.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((p) => {
      const m = buscarModulo(p.get('modulo'));
      this.modulo.set(m?.clave ?? null);
      this.tipos.set(m ? TIPOS[m.clave] : []);
      this.activo.set(this.tipos()[0] ?? null);
      this.cargar();
    });
  }

  cargar(): void {
    const m = this.modulo();
    if (!m) {
      return;
    }
    this.cargando.set(true);
    if (m === 'curriculo') {
      this.api.listar('curriculo', '/api/v1/planes-estudio').subscribe((p) => this.planes.set(p));
      this.api.opciones(REF_PERSONA).subscribe((o) => this.personas.set(new Map(o.map((x) => [String(x.valor), x.etiqueta]))));
    }
    forkJoin(this.tipos().map((t) => this.api.listar(m, t.ruta).pipe(catchError(() => of([] as Fila[]))))).subscribe((res) => {
      this.datos.set(Object.fromEntries(this.tipos().map((t, i) => [t.ruta, res[i]])));
      this.cargando.set(false);
    });
  }

  pendientes(t: TipoSolicitud): number {
    return (this.datos()[t.ruta] ?? []).filter((f) => f['estado'] === 'PENDIENTE' && this.delPrograma(f)).length;
  }

  abrirRespuesta(fila: Fila, aprobada: boolean): void {
    this.observacion = '';
    this.respondiendo.set({ fila, aprobada });
  }

  responder(): void {
    const r = this.respondiendo();
    const m = this.modulo();
    const t = this.activo();
    if (!r || !m || !t) {
      return;
    }
    const id = r.fila['id'];
    const obs: Observable<unknown> =
      t.responde === 'accion'
        ? this.api.post(m, `${t.ruta}/${id}/responder`, { aprobada: r.aprobada, observacion: this.observacion || null })
        : this.api.post(m, '/api/v1/respuestas-solicitud-apertura', { idSolicitud: id, aprobada: r.aprobada, observacion: this.observacion || null });
    obs.subscribe({
      next: () => {
        this.respondiendo.set(null);
        this.aviso.set(`Solicitud #${id} ${r.aprobada ? 'aprobada' : 'rechazada'}${r.aprobada && t.responde === 'accion' && m !== 'curriculo' ? ': el cambio ya se aplicó' : ''}.`);
        setTimeout(() => this.aviso.set(null), 4000);
        this.cargar();
      },
      error: (e) => {
        this.respondiendo.set(null);
        this.error.set(textoError(e));
      },
    });
  }

  titulo(k: string): string {
    return humanizar(k).toUpperCase();
  }

  texto(v: unknown): string {
    return textoCelda(v);
  }

  /** Celda de la tabla: el plan se muestra con su version y la persona con su nombre, nunca el id. */
  celda(f: Fila, k: string): string {
    if (k === 'idPlan') {
      const plan = this.planes().find((p) => String(p['id']) === String(f[k]));
      return plan ? `${plan['version']} · ${plan['nombre']}` : textoCelda(f[k]);
    }
    if (k === 'idSolicitante' || k === 'idPersona') {
      return this.personas().get(String(f[k])) ?? textoCelda(f[k]);
    }
    return textoCelda(f[k]);
  }

  insignia(v: unknown) {
    return insigniaEstado(v);
  }
}
