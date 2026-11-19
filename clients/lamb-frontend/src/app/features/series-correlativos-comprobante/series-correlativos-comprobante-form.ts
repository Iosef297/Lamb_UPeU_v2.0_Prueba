import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { SeriesCorrelativosComprobanteRequest } from './series-correlativos-comprobante.model';
import { SeriesCorrelativosComprobanteService } from './series-correlativos-comprobante-service';

@Component({
  selector: 'app-series-correlativos-comprobante-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './series-correlativos-comprobante-form.html',
})
export class SeriesCorrelativosComprobanteForm {
  private readonly servicio = inject(SeriesCorrelativosComprobanteService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      tipoDocumento: ['', [Validators.required]],
      serie: ['', [Validators.required]],
      correlativoActual: [0, [Validators.required]],
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
    const request = this.form.getRawValue() as SeriesCorrelativosComprobanteRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/series-correlativos-comprobante']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
