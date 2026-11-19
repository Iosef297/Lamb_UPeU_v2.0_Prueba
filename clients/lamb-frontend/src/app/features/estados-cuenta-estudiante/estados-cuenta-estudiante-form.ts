import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { EstadosCuentaEstudianteRequest } from './estados-cuenta-estudiante.model';
import { EstadosCuentaEstudianteService } from './estados-cuenta-estudiante-service';

@Component({
  selector: 'app-estados-cuenta-estudiante-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './estados-cuenta-estudiante-form.html',
})
export class EstadosCuentaEstudianteForm {
  private readonly servicio = inject(EstadosCuentaEstudianteService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPersona: [0, [Validators.required]],
      periodo: ['', [Validators.required]],
      saldoFinal: [0, [Validators.required]],
      fechaGeneracion: ['', [Validators.required]],
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
    const request = this.form.getRawValue() as EstadosCuentaEstudianteRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/estados-cuenta-estudiante']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
