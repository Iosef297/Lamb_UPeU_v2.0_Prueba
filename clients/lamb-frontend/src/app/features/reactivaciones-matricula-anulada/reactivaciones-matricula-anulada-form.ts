import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { ReactivacionesMatriculaAnuladaRequest } from './reactivaciones-matricula-anulada.model';
import { ReactivacionesMatriculaAnuladaService } from './reactivaciones-matricula-anulada-service';

@Component({
  selector: 'app-reactivaciones-matricula-anulada-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reactivaciones-matricula-anulada-form.html',
})
export class ReactivacionesMatriculaAnuladaForm {
  private readonly servicio = inject(ReactivacionesMatriculaAnuladaService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idMatricula: [0, [Validators.required]],
      motivo: ['', [Validators.required]],
      fechaReactivacion: ['', [Validators.required]],
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
    const request = this.form.getRawValue() as ReactivacionesMatriculaAnuladaRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/reactivaciones-matricula-anulada']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
