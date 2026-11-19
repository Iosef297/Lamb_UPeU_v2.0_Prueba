import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AcademicoApi, Fila } from '../academico-api';
import { Estudiante, EstudiantesGrupo } from '../comun/estudiantes-grupo';
import { textoError } from '../comun/formulario-modal';
import { SesionUi } from '../comun/sesion-ui';
import { MiActa, MisGrupos } from '../comun/mis-grupos';
import { ActivatedRoute } from '@angular/router';
import { SinGuion } from '../../core/sin-guion.pipe';

type Estado = 'PRESENTE' | 'TARDANZA' | 'FALTA' | 'JUSTIFICADA';

interface Fila2 {
  est: Estudiante;
  estado: Estado | null;
  idRegistro: number | null;
  original: Estado | null;
}

const OPCIONES: { estado: Estado; corto: string; bg: string; color: string }[] = [
  { estado: 'PRESENTE', corto: '✓ Presente', bg: '#DCFCE7', color: '#16A34A' },
  { estado: 'TARDANZA', corto: 'Tardanza', bg: '#FEF3C7', color: '#B45309' },
  { estado: 'FALTA', corto: '✕ Falta', bg: '#FEE2E2', color: '#DC2626' },
  { estado: 'JUSTIFICADA', corto: 'Justificada', bg: '#EFF6FF', color: '#1E3A8A' },
];

/** Control de asistencia por grupo y fecha/sesion (E4) con resumen y riesgo de inhabilitacion (30 %). */
@Component({
  selector: 'ac-asistencia',
  imports: [SinGuion, FormsModule],
  templateUrl: './asistencia.html',
})
export class Asistencia {
  readonly api = inject(AcademicoApi);
  private readonly sesion = inject(SesionUi);
  private readonly estudiantesGrupo = inject(EstudiantesGrupo);
  private readonly route = inject(ActivatedRoute);
  readonly mis = inject(MisGrupos);
  readonly misActas = signal<MiActa[]>([]);
  readonly miPermiso = computed(() => this.misActas().find((m) => m.idGrupo === this.idGrupo()) ?? null);

  readonly actas = signal<Fila[]>([]);
  readonly idGrupo = signal<number | null>(null);
  readonly registros = signal<Fila[]>([]);
  readonly filas = signal<Fila2[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  fecha = new Date().toISOString().slice(0, 10);
  idSesionClase = '';
  // Teoria y Practica se marcan por separado (cada bloque tiene su docente)
  tipoHorario: 'TEORIA' | 'PRACTICA' = 'TEORIA';

  readonly opciones = OPCIONES;
  readonly editable = computed(
    () =>
      this.sesion.puedeEscribir(['ADMIN', 'COORDINADOR', 'DOCENTE']) &&
      (!this.mis.soloDocente() || !!this.miPermiso()?.puedeRegistrarAsistencia),
  );
  readonly cambios = computed(() => this.filas().filter((f) => f.estado && f.estado !== f.original).length);

  readonly grupos = computed(() => {
    const p = this.api.periodo();
    const mios = new Set(this.misActas().map((m) => m.idGrupo));
    return this.actas().filter(
      (a) => a['estado'] !== 'RECHAZADA' && (!p || a['periodo'] === p) && (!this.mis.soloDocente() || mios.has(Number(a['idGrupo']))),
    );
  });

  /** % de inasistencia de cada estudiante en todo el grupo (las faltas justificadas no cuentan). */
  readonly resumen = computed(() =>
    this.filas().map((f) => {
      const propios = this.registros().filter((r) => Number(r['idPersona']) === f.est.idPersona);
      const faltas = propios.filter((r) => r['estado'] === 'FALTA').length;
      const pct = propios.length ? Math.round((faltas * 100) / propios.length) : 0;
      return { est: f.est, sesiones: propios.length, faltas, pct, riesgo: pct >= 30 ? 'INHABILITADO' : pct >= 20 ? 'EN RIESGO' : 'NORMAL' };
    }),
  );

  constructor() {
    if (this.mis.soloDocente()) {
      this.mis.misActas().subscribe((m) => this.misActas.set(m));
    }
    this.api.get<Fila[]>('evaluacion', '/api/v1/actas').subscribe({
      next: (a) => {
        this.actas.set(a);
        const pedido = Number(this.route.snapshot.queryParamMap.get('grupo'));
        if (pedido) {
          this.elegirGrupo(String(pedido));
        }
      },
      error: (e) => this.error.set(textoError(e)),
    });
  }

  elegirGrupo(v: string): void {
    this.idGrupo.set(Number(v) || null);
    this.cargar();
  }

  cargar(): void {
    const g = this.idGrupo();
    if (!g) {
      return;
    }
    this.cargando.set(true);
    this.api.listar('evaluacion', '/api/v1/registros-asistencia', { idGrupo: g }).subscribe({
      next: (regs) => {
        this.registros.set(regs);
        this.estudiantesGrupo.delGrupo(g, regs).subscribe((est) => {
          this.armarFilas(est);
          this.cargando.set(false);
        });
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(textoError(e));
      },
    });
  }

  private armarFilas(est: Estudiante[]): void {
    const sesion = this.idSesionClase ? Number(this.idSesionClase) : null;
    this.filas.set(
      est.map((e) => {
        const r = this.registros().find(
          (x) => Number(x['idPersona']) === e.idPersona && x['fecha'] === this.fecha && (sesion === null || Number(x['idSesionClase']) === sesion) &&
            (x['tipoHorario'] ?? 'TEORIA') === this.tipoHorario,
        );
        const estado = (r?.['estado'] as Estado) ?? null;
        return { est: e, estado, idRegistro: r ? Number(r['id']) : null, original: estado };
      }),
    );
  }

  cambiarFecha(): void {
    this.armarFilas(this.filas().map((f) => f.est));
  }

  marcar(f: Fila2, estado: Estado): void {
    this.filas.update((l) => l.map((x) => (x === f ? { ...x, estado } : x)));
  }

  todosPresentes(): void {
    this.filas.update((l) => l.map((x) => (x.estado ? x : { ...x, estado: 'PRESENTE' })));
  }

  guardar(): void {
    const g = this.idGrupo();
    const pendientes = this.filas().filter((f) => f.estado && f.estado !== f.original);
    if (!g || pendientes.length === 0) {
      return;
    }
    this.guardando.set(true);
    this.error.set(null);
    const sesion = this.idSesionClase ? Number(this.idSesionClase) : null;
    forkJoin(
      pendientes.map((f) => {
        const cuerpo = { idGrupo: g, idPersona: f.est.idPersona, idSesionClase: sesion, fecha: this.fecha, estado: f.estado, tipoHorario: this.tipoHorario };
        return f.idRegistro
          ? this.api.put('evaluacion', `/api/v1/registros-asistencia/${f.idRegistro}`, cuerpo)
          : this.api.post('evaluacion', '/api/v1/registros-asistencia', cuerpo);
      }),
    ).subscribe({
      next: () => {
        this.guardando.set(false);
        this.aviso.set(`Asistencia del ${this.fecha} guardada (${pendientes.length} registro(s)).`);
        setTimeout(() => this.aviso.set(null), 3500);
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(textoError(e));
        this.cargar();
      },
    });
  }

  estilo(estado: Estado | null) {
    return OPCIONES.find((o) => o.estado === estado);
  }
}
