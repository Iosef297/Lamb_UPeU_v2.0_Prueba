import { mensajeError } from '../../core/http/mensaje-error';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth-service';
import { PagoService } from './pago-service';
import { PagoResponse } from './pago.model';

@Component({
  selector: 'app-pago-list',
  imports: [RouterLink],
  templateUrl: './pago-list.html',
})
export class PagoList {
  private readonly service = inject(PagoService);
  protected readonly auth = inject(AuthService);

  protected readonly pagos = signal<PagoResponse[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly errorAccion = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.error.set(null);
    this.service.listar().subscribe({
      next: (data) => this.pagos.set([...data].sort((a, b) => b.id - a.id)),
      error: (e) => this.error.set(mensajeError(e, 'No se pudieron cargar los pagos.')),
    });
  }

  protected aceptar(pago: PagoResponse): void {
    this.accion(this.service.aceptar(pago.id), `Pago ${pago.id} aprobado.`, 'No se pudo aprobar el pago.');
  }

  protected rechazar(pago: PagoResponse): void {
    this.accion(this.service.rechazar(pago.id), `Pago ${pago.id} rechazado.`, 'No se pudo rechazar el pago.');
  }

  protected reembolsar(pago: PagoResponse): void {
    if (!confirm(`Reembolsar S/ ${pago.monto} del pago ${pago.id}?`)) {
      return;
    }
    this.accion(this.service.reembolsar(pago.id), `Pago ${pago.id} reembolsado.`, 'No se pudo reembolsar el pago.');
  }

  private accion(peticion: Observable<unknown>, ok: string, fallo: string): void {
    this.errorAccion.set(null);
    this.exito.set(null);
    peticion.subscribe({
      next: () => {
        this.exito.set(ok);
        this.cargar();
      },
      error: (e) => this.errorAccion.set(mensajeError(e, fallo)),
    });
  }
}
