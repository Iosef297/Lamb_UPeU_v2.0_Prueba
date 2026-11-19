import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { TransferenciasPagoRequest } from './transferencias-pago.model';
import { TransferenciasPagoService } from './transferencias-pago-service';

@Component({
  selector: 'app-transferencias-pago-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './transferencias-pago-form.html',
})
export class TransferenciasPagoForm {
  private readonly servicio = inject(TransferenciasPagoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPagoOrigen: [0, [Validators.required]],
      idPagoDestino: [0, []],
      monto: [0, [Validators.required]],
      motivo: ['', []],
      fechaTransferencia: ['', [Validators.required]],
  });

  constructor() {
    if (this.id) {
      this.servicio.obtener(Number(this.id)).subscribe({
        next: (data) => this.form.patchValue(data),
        error: (err) => this.error.set(mensajeError(err, 'No se pudo cargar el registro.')),
      });
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    const request = this.form.getRawValue() as TransferenciasPagoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/transferencias-pago']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
