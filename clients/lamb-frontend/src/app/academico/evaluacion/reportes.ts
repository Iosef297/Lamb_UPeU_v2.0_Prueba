import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicoApi, Fila, Opcion, textoCelda } from '../academico-api';
import { textoError } from '../comun/formulario-modal';

/** Vistas calculadas de evaluacion: cuadro de meritos, nota final y evaluacion docente. */
@Component({
  selector: 'ac-reportes',
  imports: [FormsModule],
  template: `
    <div class="ac-page">
      <div class="ac-head">
        <div>
          <h2>Reportes de Evaluación</h2>
          <p class="sub">Vistas calculadas por el microservicio de evaluación</p>
        </div>
      </div>

      <!-- Cuadro de meritos -->
      <div class="ac-card">
        <div class="ac-card-head"><h3>Cuadro de méritos</h3><span style="font-size: 0.75rem; color: #94a3b8">Promedio ponderado por créditos, tercio superior</span></div>
        <div class="ac-filtros">
          <div class="ac-field" style="min-width: 200px">
            <label>Periodo</label>
            <input class="ac-input" [(ngModel)]="periodo" placeholder="2026-2" />
          </div>
          <button type="button" class="ac-btn-navy" (click)="verMeritos()">Consultar</button>
        </div>
        @if (errMeritos()) {
          <div class="ac-alerta error" style="margin: 12px 20px">{{ errMeritos() }}</div>
        }
        @if (meritos(); as m) {
          @if (m.length === 0) {
            <div class="ac-vacio">Sin actas cerradas en el periodo.</div>
          } @else {
            <table class="ac-table">
              <thead><tr><th>PUESTO</th><th>ESTUDIANTE</th><th>PROMEDIO</th><th>CURSOS</th><th>TERCIO SUPERIOR</th></tr></thead>
              <tbody>
                @for (f of m; track $index) {
                  <tr>
                    <td><span class="ac-ciclo-num" style="display: inline-flex">{{ f['posicion'] }}</span></td>
                    <td class="fuerte">Persona #{{ f['idPersona'] }}</td>
                    <td><span class="ac-nota" [class.ok]="+$any(f['promedio']) >= 10.5" [class.mal]="+$any(f['promedio']) < 10.5">{{ num(f['promedio']) }}</span></td>
                    <td>{{ f['cursos'] }}</td>
                    <td><span class="ac-badge" [style.background]="f['tercioSuperior'] ? '#DCFCE7' : '#F1F5F9'" [style.color]="f['tercioSuperior'] ? '#16A34A' : '#64748B'">{{ f['tercioSuperior'] ? 'Sí' : 'No' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          }
        }
      </div>

      <div class="ac-grid-2" style="margin-top: 20px">
        <!-- Nota final -->
        <div class="ac-card" style="margin-top: 0">
          <div class="ac-card-head"><h3>Nota final de un estudiante</h3></div>
          <div class="ac-card-body">
            <div class="ac-form-grid" style="grid-template-columns: 1fr 1fr">
              <div class="ac-field">
                <label>Grupo</label>
                <select class="ac-input" [(ngModel)]="idGrupo">
                  <option value="">— Seleccione —</option>
                  @for (g of grupos(); track g.valor) {
                    <option [value]="g.valor">{{ g.etiqueta }}</option>
                  }
                </select>
              </div>
              <div class="ac-field">
                <label>Id estudiante (persona)</label>
                <input class="ac-input" type="number" [(ngModel)]="idPersona" />
              </div>
            </div>
            <div class="ac-form-actions" style="margin-top: 16px"><button type="button" class="ac-btn-navy" (click)="verNotaFinal()">Calcular</button></div>
            @if (errNota()) {
              <div class="ac-alerta error">{{ errNota() }}</div>
            }
            @if (notaFinal(); as n) {
              <div class="ac-stat" style="margin-top: 8px">
                
                <div>
                  <p class="val" [style.color]="n['aprobado'] ? '#16A34A' : '#DC2626'">{{ num(n['notaFinal']) }}</p>
                  <p class="lbl">{{ n['aprobado'] ? 'Aprobado' : 'Desaprobado' }} · grupo #{{ n['idGrupo'] }} · persona #{{ n['idPersona'] }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Evaluacion docente -->
        <div class="ac-card" style="margin-top: 0">
          <div class="ac-card-head"><h3>Resultado de evaluación docente</h3></div>
          <div class="ac-card-body">
            <div class="ac-form-grid" style="grid-template-columns: 1fr 1fr">
              <div class="ac-field">
                <label>Encuesta</label>
                <select class="ac-input" [(ngModel)]="idEncuesta">
                  <option value="">— Seleccione —</option>
                  @for (e of encuestas(); track e.valor) {
                    <option [value]="e.valor">{{ e.etiqueta }}</option>
                  }
                </select>
              </div>
              <div class="ac-field">
                <label>Id docente</label>
                <input class="ac-input" type="number" [(ngModel)]="idDocente" />
              </div>
            </div>
            <div class="ac-form-actions" style="margin-top: 16px"><button type="button" class="ac-btn-navy" (click)="verDocente()">Consultar</button></div>
            @if (errDocente()) {
              <div class="ac-alerta error">{{ errDocente() }}</div>
            }
            @if (docente(); as d) {
              @if (d.length === 0) {
                <p style="font-size: 0.8rem; color: #94a3b8">Sin respuestas para el docente.</p>
              } @else {
                <table class="ac-table compacta">
                  <thead><tr><th>N°</th><th>PREGUNTA</th><th>TIPO</th><th>RESP.</th><th>RESULTADO</th></tr></thead>
                  <tbody>
                    @for (p of d; track $index) {
                      <tr>
                        <td class="n">{{ p['orden'] }}</td>
                        <td class="fuerte" style="white-space: normal">{{ p['enunciado'] }}</td>
                        <td>{{ texto(p['tipo']) }}</td>
                        <td>{{ p['respuestas'] }}</td>
                        <td>{{ num(p['resultado']) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Reportes {
  private readonly api = inject(AcademicoApi);

  periodo = this.api.periodo();
  idGrupo = '';
  idPersona = '';
  idEncuesta = '';
  idDocente = '';

  readonly grupos = signal<Opcion[]>([]);
  readonly encuestas = signal<Opcion[]>([]);
  readonly meritos = signal<Fila[] | null>(null);
  readonly notaFinal = signal<Fila | null>(null);
  readonly docente = signal<Fila[] | null>(null);
  readonly errMeritos = signal<string | null>(null);
  readonly errNota = signal<string | null>(null);
  readonly errDocente = signal<string | null>(null);

  constructor() {
    this.api.opciones({ ms: 'planificacion', ruta: '/api/v1/grupos' }).subscribe((o) => this.grupos.set(o));
    this.api.opciones({ ms: 'evaluacion', ruta: '/api/v1/encuestas-docente' }).subscribe((o) => this.encuestas.set(o));
    if (this.periodo) {
      this.verMeritos();
    }
  }

  verMeritos(): void {
    this.errMeritos.set(null);
    this.api.listar('evaluacion', '/api/v1/vistas/cuadro-meritos', { periodo: this.periodo }).subscribe({
      next: (m) => this.meritos.set(m),
      error: (e) => this.errMeritos.set(textoError(e)),
    });
  }

  verNotaFinal(): void {
    this.errNota.set(null);
    this.notaFinal.set(null);
    this.api.get<Fila>('evaluacion', '/api/v1/vistas/nota-final', { idGrupo: this.idGrupo, idPersona: this.idPersona }).subscribe({
      next: (n) => this.notaFinal.set(n),
      error: (e) => this.errNota.set(textoError(e)),
    });
  }

  verDocente(): void {
    this.errDocente.set(null);
    this.api.listar('evaluacion', '/api/v1/vistas/resultado-evaluacion-docente', { idEncuesta: this.idEncuesta, idDocente: this.idDocente }).subscribe({
      next: (d) => this.docente.set(d),
      error: (e) => this.errDocente.set(textoError(e)),
    });
  }

  num(v: unknown): string {
    return v === null || v === undefined ? '—' : Number(v).toFixed(2);
  }

  texto(v: unknown): string {
    return textoCelda(v);
  }
}
