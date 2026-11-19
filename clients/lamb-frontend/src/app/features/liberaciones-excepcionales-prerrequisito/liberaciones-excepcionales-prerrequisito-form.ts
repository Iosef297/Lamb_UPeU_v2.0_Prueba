import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { LiberacionesExcepcionalesPrerrequisitoRequest } from './liberaciones-excepcionales-prerrequisito.model';
import { LiberacionesExcepcionalesPrerrequisitoService } from './liberaciones-excepcionales-prerrequisito-service';

@Component({
  selector: 'app-liberaciones-excepcionales-prerrequisito-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './liberaciones-excepcionales-prerrequisito-form.html',
})
export class LiberacionesExcepcionalesPrerrequisitoForm {
  private readonly servicio = inject(LiberacionesExcepcionalesPrerrequisitoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPersona: [0, [Validators.required]],
      idCurso: [0, [Validators.required]],
      idPrerrequisito: [0, [Validators.required]],
      motivo: ['', [Validators.required]],
      fechaAutorizacion: ['', [Validators.required]],
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
    const request = this.form.getRawValue() as LiberacionesExcepcionalesPrerrequisitoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/liberaciones-excepcionales-prerrequisito']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
