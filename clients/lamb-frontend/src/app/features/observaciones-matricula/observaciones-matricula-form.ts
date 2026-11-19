import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { ObservacionesMatriculaRequest } from './observaciones-matricula.model';
import { ObservacionesMatriculaService } from './observaciones-matricula-service';

@Component({
  selector: 'app-observaciones-matricula-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './observaciones-matricula-form.html',
})
export class ObservacionesMatriculaForm {
  private readonly servicio = inject(ObservacionesMatriculaService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idMatricula: [0, [Validators.required]],
      observacion: ['', [Validators.required]],
      fechaObservacion: ['', [Validators.required]],
      usuarioRegistro: ['', []],
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
    const request = this.form.getRawValue() as ObservacionesMatriculaRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/observaciones-matricula']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
