import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth-service';
import { mensajeError } from '../../core/http/mensaje-error';
import { ConstanciasNoAdeudoResponse } from './constancias-no-adeudo.model';
import { ConstanciasNoAdeudoService } from './constancias-no-adeudo-service';

@Component({
  selector: 'app-constancias-no-adeudo-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './constancias-no-adeudo-list.html',
})
export class ConstanciasNoAdeudoList {
  private readonly servicio = inject(ConstanciasNoAdeudoService);
  protected readonly auth = inject(AuthService);

  protected readonly items = signal<ConstanciasNoAdeudoResponse[]>([]);
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
