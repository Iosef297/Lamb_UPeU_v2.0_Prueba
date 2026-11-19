import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { ReembolsosPagoRequest } from './reembolsos-pago.model';
import { ReembolsosPagoService } from './reembolsos-pago-service';

@Component({
  selector: 'app-reembolsos-pago-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reembolsos-pago-form.html',
})
export class ReembolsosPagoForm {
  private readonly servicio = inject(ReembolsosPagoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPago: [0, [Validators.required]],
      montoReembolsado: [0, [Validators.required]],
      fechaReembolso: ['', [Validators.required]],
      estado: ['', []],
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
    const request = this.form.getRawValue() as ReembolsosPagoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/reembolsos-pago']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
