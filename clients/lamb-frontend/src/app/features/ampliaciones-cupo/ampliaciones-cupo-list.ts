import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth-service';
import { mensajeError } from '../../core/http/mensaje-error';
import { AmpliacionesCupoResponse } from './ampliaciones-cupo.model';
import { AmpliacionesCupoService } from './ampliaciones-cupo-service';

@Component({
  selector: 'app-ampliaciones-cupo-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ampliaciones-cupo-list.html',
})
export class AmpliacionesCupoList {
  private readonly servicio = inject(AmpliacionesCupoService);
  protected readonly auth = inject(AuthService);

  protected readonly items = signal<AmpliacionesCupoResponse[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly errorAccion = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  cargar() {
    this.error.set(null);
    this.servicio.listar().subscribe({
      next: (data) => this.items.set(data),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo cargar la lista.')),
    });
  }

  private accion(obs: Observable<unknown>) {
    this.errorAccion.set(null);
    this.exito.set(null);
    obs.subscribe({
      next: () => {
        this.exito.set('Operación realizada.');
        this.cargar();
      },
      error: (err) => this.errorAccion.set(mensajeError(err, 'No se pudo completar la operación.')),
    });
  }


}
