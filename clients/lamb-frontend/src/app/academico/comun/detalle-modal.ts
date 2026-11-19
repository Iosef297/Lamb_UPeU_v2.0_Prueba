import { Component, computed, input, output } from '@angular/core';
import { Fila, esCampoEstado, humanizar, insigniaEstado, textoCelda } from '../academico-api';

interface Par {
  clave: string;
  valor: unknown;
}

/** Ficha de un registro: datos simples en grilla y listas anidadas como tablas. */
@Component({
  selector: 'ac-detalle-modal',
  template: `
    <div class="ac-modal-back" (click)="cerrar.emit()">
      <div class="ac-modal" (click)="$event.stopPropagation()">
        <div class="ac-modal-head">
          <h3>{{ titulo() }}</h3>
          <button type="button" class="x" (click)="cerrar.emit()">✕</button>
        </div>
        <div class="ac-modal-body">
          <div class="ac-kv">
            @for (p of simples(); track p.clave) {
              <div>
                <p class="k">{{ nombre(p.clave) }}</p>
                @if (esEstado(p.clave)) {
                  <span class="ac-badge" [style.background]="ins(p.valor).bg" [style.color]="ins(p.valor).color">{{ texto(p.valor) }}</span>
                } @else {
                  <p class="v">{{ texto(p.valor) }}</p>
                }
              </div>
            }
          </div>
          @for (l of listas(); track l.clave) {
            <div class="ac-seccion-tit"><h4>{{ nombre(l.clave) }} ({{ l.filas.length }})</h4></div>
            @if (l.filas.length === 0) {
              <p style="font-size: 0.8rem; color: #94a3b8">Sin registros.</p>
            } @else if (l.simple) {
              <p style="font-size: 0.85rem; color: #334155">{{ l.filas.join(', ') }}</p>
            } @else {
              <div class="ac-card">
                <div class="ac-table-wrap">
                  <table class="ac-table compacta">
                    <thead>
                      <tr>
                        @for (k of l.columnas; track k) {
                          <th>{{ nombre(k).toUpperCase() }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (f of l.filas; track $index) {
                        <tr>
                          @for (k of l.columnas; track k) {
                            <td>{{ texto($any(f)[k]) }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class DetalleModal {
  readonly titulo = input('Detalle');
  readonly fila = input.required<Fila>();
  readonly cerrar = output<void>();

  readonly simples = computed<Par[]>(() =>
    Object.entries(this.fila())
      .filter(([, v]) => !Array.isArray(v))
      .map(([clave, valor]) => ({ clave, valor })),
  );

  readonly listas = computed(() =>
    Object.entries(this.fila())
      .filter(([, v]) => Array.isArray(v))
      .map(([clave, v]) => {
        const filas = v as unknown[];
        const simple = filas.every((x) => typeof x !== 'object' || x === null);
        const columnas = simple ? [] : [...new Set(filas.flatMap((x) => Object.keys(x as object)))].filter((k) => !Array.isArray((filas[0] as Fila)[k]));
        return { clave, filas, simple, columnas };
      }),
  );

  nombre(k: string): string {
    return k === 'id' ? 'Id' : humanizar(k);
  }

  texto(v: unknown): string {
    return textoCelda(v);
  }

  esEstado(k: string): boolean {
    return esCampoEstado(k);
  }

  ins(v: unknown) {
    return insigniaEstado(typeof v === 'boolean' ? (v ? 'SI' : 'NO') : v);
  }
}
