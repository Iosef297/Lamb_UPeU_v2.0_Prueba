import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AcademicoApi, Fila, insigniaEstado, textoCelda } from '../academico-api';
import { TablaRecurso } from '../comun/tabla-recurso';

interface Pestana {
  clave: string;
  etiqueta: string;
  ruta?: string;
}

// Pestañas del detalle de grupo (guia P6): todas filtran por idGrupo
const PESTANAS: Pestana[] = [
  { clave: 'resumen', etiqueta: 'Resumen' },
  { clave: 'horarios', etiqueta: 'Horarios', ruta: '/api/v1/horarios-grupo' },
  { clave: 'docentes', etiqueta: 'Docentes', ruta: '/api/v1/asignaciones-docente' },
  { clave: 'cupos', etiqueta: 'Cupos por tipo', ruta: '/api/v1/cupos-grupo' },
  { clave: 'aula', etiqueta: 'Aula virtual', ruta: '/api/v1/aulas-virtuales' },
  { clave: 'silabo', etiqueta: 'Sílabo', ruta: '/api/v1/silabos-grupo' },
  { clave: 'conformidad', etiqueta: 'Conformidades', ruta: '/api/v1/conformidades-silabo' },
  { clave: 'cierre', etiqueta: 'Cierre / fusión', ruta: '/api/v1/solicitudes-cierre-fusion' },
  { clave: 'acta', etiqueta: 'Acta' },
];

/** Ventana de detalle de un grupo con sus sub-recursos en pestañas. */
@Component({
  selector: 'ac-grupo-detalle',
  imports: [TablaRecurso],
  template: `
    <div class="ac-modal-back" (click)="cerrar.emit()">
      <div class="ac-modal" style="max-width: 1100px" (click)="$event.stopPropagation()">
        <div class="ac-modal-head">
          <h3>Grupo {{ grupo()['codigo'] }} · {{ curso() }}</h3>
          <button type="button" class="x" (click)="cerrar.emit()">✕</button>
        </div>
        <div class="ac-modal-body" style="background: #f1f5f9">
          <div class="ac-chips">
            @for (p of pestanas; track p.clave) {
              <button type="button" class="ac-chip" [class.on]="p.clave === pestana().clave" (click)="pestana.set(p)">{{ p.etiqueta }}</button>
            }
          </div>

          @switch (pestana().clave) {
            @case ('resumen') {
              <div class="ac-card">
                <div class="ac-card-body">
                  <div class="ac-kv">
                    <div><p class="k">Estado</p><span class="ac-badge" [style.background]="ins(grupo()['estado']).bg" [style.color]="ins(grupo()['estado']).color">{{ texto(grupo()['estado']) }}</span></div>
                    <div><p class="k">Periodo</p><p class="v">{{ grupo()['periodo'] }}</p></div>
                    <div><p class="k">Cupo máximo</p><p class="v">{{ grupo()['cupoMaximo'] }}</p></div>
                    <div><p class="k">Programa</p><p class="v">{{ programa() }}</p></div>
                    <div><p class="k">Curso</p><p class="v">{{ curso() }}</p></div>
                    <div><p class="k">Créditos</p><p class="v">{{ $any(grupo()['curso'])?.creditos ?? '—' }}</p></div>
                    <div><p class="k">Oferta</p><p class="v">#{{ grupo()['idOferta'] }}</p></div>
                    <div><p class="k">Versión</p><p class="v">{{ grupo()['version'] }}</p></div>
                  </div>
                  <div class="ac-seccion-tit"><h4>Permisos del docente en este grupo</h4></div>
                  <label class="ac-check">
                    <input type="checkbox" [checked]="silaboAbierto()" (change)="permisoSilabo($any($event.target).checked)" />
                    Puede editar el sílabo y el plan de clase
                  </label>
                  <div class="ac-field" style="max-width: 320px; margin-top: 8px">
                    <label>Delegado del grupo (id persona del estudiante)</label>
                    <div style="display: flex; gap: 6px">
                      <input class="ac-input" type="number" min="1" placeholder="Sin delegado" [value]="delegado() ?? ''" #del />
                      <button type="button" class="ac-btn-ligero" (click)="guardarPermisos(silaboAbierto(), del.value ? +del.value : null)">Guardar</button>
                    </div>
                  </div>
                  @if (aviso()) {
                    <div class="ac-alerta ok" style="margin-top: 8px">{{ aviso() }}</div>
                  }
                  @if (grupo()['motivo']) {
                    <div class="ac-alerta aviso" style="margin-top: 16px">{{ grupo()['motivo'] }}</div>
                  }
                </div>
              </div>
            }
            @case ('acta') {
              <div class="ac-card">
                <div class="ac-card-body">
                  @if (acta(); as a) {
                    <div class="ac-kv">
                      <div><p class="k">Acta</p><p class="v">#{{ a['id'] }}</p></div>
                      <div><p class="k">Estado</p><span class="ac-badge" [style.background]="ins(a['estado']).bg" [style.color]="ins(a['estado']).color">{{ texto(a['estado']) }}</span></div>
                      <div><p class="k">Modo</p><p class="v">{{ texto(a['modoEvaluacion']) }}</p></div>
                      <div><p class="k">Docente</p><p class="v">{{ a['idDocente'] ? '#' + a['idDocente'] : '—' }}</p></div>
                    </div>
                    <div class="ac-seccion-tit"><h4>Permisos del docente</h4></div>
                    <label class="ac-check">
                      <input type="checkbox" [checked]="a['notasHabilitadas']" (change)="permisoActa('notas', $any($event.target).checked)" /> Puede registrar notas
                    </label>
                    <label class="ac-check">
                      <input type="checkbox" [checked]="a['asistenciaHabilitada']" (change)="permisoActa('asistencia', $any($event.target).checked)" /> Puede registrar asistencia
                    </label>
                    @if (aviso()) {
                      <div class="ac-alerta ok" style="margin-top: 8px">{{ aviso() }}</div>
                    }
                    <div class="ac-form-actions">
                      <button type="button" class="ac-btn-out" (click)="ir('/academico/evaluacion/actas')">Ver actas</button>
                      <button type="button" class="ac-btn-navy" (click)="ir('/academico/evaluacion/registro-notas', grupo()['id'])">Registrar notas</button>
                    </div>
                  } @else {
                    <div class="ac-vacio">El grupo aún no tiene acta (se crea sola cuando evaluación recibe grupo.abierto).</div>
                  }
                </div>
              </div>
            }
            @default {
              <ac-tabla-recurso
                modulo="planificacion"
                [ruta]="pestana().ruta!"
                [etiqueta]="pestana().etiqueta + ' del grupo'"
                [fijos]="{ idGrupo: grupo()['id'] }"
                [conResumen]="false"
              />
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class GrupoDetalle implements OnInit {
  private readonly api = inject(AcademicoApi);
  private readonly router = inject(Router);

  readonly grupo = input.required<Fila>();
  readonly programa = input('—');
  readonly cerrar = output<void>();

  readonly pestanas = PESTANAS;
  readonly pestana = signal<Pestana>(PESTANAS[0]);
  readonly acta = signal<Fila | null>(null);
  readonly silaboAbierto = signal(true);
  readonly delegado = signal<number | null>(null);
  readonly aviso = signal<string | null>(null);

  ngOnInit(): void {
    this.silaboAbierto.set(this.grupo()['puedeEditarSilabo'] !== false);
    this.delegado.set((this.grupo()['idDelegado'] as number | null) ?? null);
    this.api
      .get<Fila>('evaluacion', `/api/v1/actas/grupo/${this.grupo()['id']}`)
      .pipe(catchError(() => of(null)))
      .subscribe((a) => this.acta.set(a));
  }

  permisoSilabo(abierto: boolean): void {
    this.guardarPermisos(abierto, this.delegado());
  }

  // El PUT lleva siempre los dos valores: sin idDelegado el backend lo deja vacio
  guardarPermisos(abierto: boolean, idDelegado: number | null): void {
    const extra = idDelegado ? `&idDelegado=${idDelegado}` : '';
    this.api.put<Fila>('planificacion', `/api/v1/grupos/${this.grupo()['id']}/permisos?puedeEditarSilabo=${abierto}${extra}`, {}).subscribe({
      next: (g) => {
        this.silaboAbierto.set(g['puedeEditarSilabo'] !== false);
        this.delegado.set((g['idDelegado'] as number | null) ?? null);
        this.avisar(abierto ? 'Permisos guardados: sílabo abierto al docente.' : 'Permisos guardados: sílabo cerrado al docente.');
      },
      error: () => this.silaboAbierto.set(!abierto),
    });
  }

  permisoActa(cual: 'notas' | 'asistencia', abierto: boolean): void {
    const a = this.acta();
    if (!a) {
      return;
    }
    this.api.put<Fila>('evaluacion', `/api/v1/actas/${a['id']}/permisos?${cual}=${abierto}`, {}).subscribe((r) => {
      this.acta.set(r);
      this.avisar(`Registro de ${cual} ${abierto ? 'abierto' : 'cerrado'} al docente.`);
    });
  }

  private avisar(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }

  curso(): string {
    const c = this.grupo()['curso'] as Fila | null;
    return c ? `${c['codigo']} · ${c['nombre']}` : '—';
  }

  ir(ruta: string, grupo?: unknown): void {
    this.cerrar.emit();
    this.router.navigate([ruta], grupo ? { queryParams: { grupo } } : {});
  }

  texto(v: unknown): string {
    return textoCelda(v);
  }

  ins(v: unknown) {
    return insigniaEstado(v);
  }
}
