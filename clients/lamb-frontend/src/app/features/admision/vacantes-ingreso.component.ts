import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface Examen {
  id: number;
  nombre: string;
  codigo: string;
}

interface Calificacion {
  id: number;
  idExamen: number;
  nombreExamen: string;
  idPostulante: number;
  codigoPostulante: string;
  nombrePostulante: string;
  puntajeTotal: number;
  horaEntrega: string;
  ordenMerito: number;
}

@Component({
  selector: 'app-vacantes-ingreso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <h2>Vacantes e ingreso</h2>
      <p class="hint">Busca un examen por nombre o ID para ver todos los puntajes en orden de mérito.</p>

      <div class="buscador">
        <input
          type="text"
          placeholder="Buscar examen por nombre o ID..."
          [(ngModel)]="texto"
          (ngModelChange)="onBuscar()"
          (focus)="abierto.set(true)"
        />
        @if (abierto() && opciones().length) {
          <ul class="opciones">
            @for (ex of opciones(); track ex.id) {
              <li (click)="elegir(ex)">#{{ ex.id }} — {{ ex.nombre }}</li>
            }
          </ul>
        }
      </div>

      @if (examenElegido()) {
        <h3 class="examen-sel">Examen: #{{ examenElegido()!.id }} — {{ examenElegido()!.nombre }}</h3>

        @if (cargando()) { <p class="hint">Cargando...</p> }

        @if (!cargando() && ranking().length === 0) {
          <p class="hint">Sin calificaciones registradas para este examen.</p>
        }

        @if (!cargando() && ranking().length) {
          <table>
            <thead>
              <tr>
                <th>Mérito</th>
                <th>Postulante</th>
                <th>Código</th>
                <th>Puntaje total</th>
                <th>Hora de entrega</th>
              </tr>
            </thead>
            <tbody>
              @for (c of ranking(); track c.id) {
                <tr>
                  <td class="merito">{{ $index + 1 }}</td>
                  <td>{{ c.nombrePostulante || c.idPostulante }}</td>
                  <td>{{ c.codigoPostulante }}</td>
                  <td>{{ c.puntajeTotal }}</td>
                  <td>{{ c.horaEntrega | date:'short' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </div>
  `,
  styles: [`
    .wrap { padding: 1rem; font-family: system-ui; max-width: 900px; margin: 0 auto; }
    h2 { color: #003366; margin: 0 0 .25rem; text-align: center; }
    .hint { color: #666; text-align: center; }
    .buscador { position: relative; max-width: 480px; margin: 1rem auto 1.5rem; }
    .buscador input { width: 100%; padding: .6rem .8rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; box-sizing: border-box; }
    .opciones { position: absolute; z-index: 10; left: 0; right: 0; top: 100%; background: #fff; border: 1px solid #ccc; border-radius: 6px; max-height: 260px; overflow-y: auto; margin: 2px 0 0; padding: 0; list-style: none; box-shadow: 0 4px 10px rgba(0,0,0,.1); }
    .opciones li { padding: .5rem .8rem; cursor: pointer; }
    .opciones li:hover { background: #f0f4ff; }
    .examen-sel { text-align: center; color: #003366; }
    table { width: 100%; border-collapse: collapse; background: #fff; }
    th, td { padding: .6rem .75rem; border-bottom: 1px solid #eee; text-align: left; }
    th { background: #f7f7f7; font-size: .85rem; text-transform: uppercase; color: #555; }
    .merito { font-weight: 700; color: #003366; }
  `]
})
export class VacantesIngresoComponent {
  private api = inject(ApiService);

  examenes = signal<Examen[]>([]);
  texto = '';
  abierto = signal(false);
  examenElegido = signal<Examen | null>(null);
  calificaciones = signal<Calificacion[]>([]);
  cargando = signal(false);

  opciones = computed(() => {
    const t = this.texto.trim().toLowerCase();
    const todos = this.examenes();
    if (!t) return todos.slice(0, 20);
    return todos
      .filter(e => e.nombre.toLowerCase().includes(t) || String(e.id).includes(t))
      .slice(0, 20);
  });

  ranking = computed(() => {
    return [...this.calificaciones()].sort((a, b) => {
      const diff = (b.puntajeTotal ?? 0) - (a.puntajeTotal ?? 0);
      if (diff !== 0) return diff;
      return new Date(a.horaEntrega).getTime() - new Date(b.horaEntrega).getTime();
    });
  });

  constructor() {
    this.api.list<Examen>('/api/v1/examenes-admision').subscribe(r => this.examenes.set(r));
  }

  onBuscar() { this.abierto.set(true); }

  elegir(ex: Examen) {
    this.examenElegido.set(ex);
    this.texto = `${ex.id} — ${ex.nombre}`;
    this.abierto.set(false);
    this.cargando.set(true);
    this.api.list<Calificacion>(`/api/v1/calificaciones?idExamen=${ex.id}`).subscribe({
      next: r => { this.calificaciones.set(r); this.cargando.set(false); },
      error: () => { this.calificaciones.set([]); this.cargando.set(false); }
    });
  }
}
