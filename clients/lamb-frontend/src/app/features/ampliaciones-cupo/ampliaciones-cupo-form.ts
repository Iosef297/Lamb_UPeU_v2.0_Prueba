import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { AmpliacionesCupoRequest } from './ampliaciones-cupo.model';
import { AmpliacionesCupoService } from './ampliaciones-cupo-service';

@Component({
  selector: 'app-ampliaciones-cupo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ampliaciones-cupo-form.html',
})
export class AmpliacionesCupoForm {
  private readonly servicio = inject(AmpliacionesCupoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idSeccion: [0, [Validators.required]],
      cupoAdicional: [0, [Validators.required]],
      motivo: ['', []],
      autorizadoPor: ['', []],
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
    const request = this.form.getRawValue() as AmpliacionesCupoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/ampliaciones-cupo']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
