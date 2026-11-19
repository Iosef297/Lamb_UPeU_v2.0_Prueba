import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { EstudiantesObservadosSuspendidosRequest } from './estudiantes-observados-suspendidos.model';
import { EstudiantesObservadosSuspendidosService } from './estudiantes-observados-suspendidos-service';

@Component({
  selector: 'app-estudiantes-observados-suspendidos-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './estudiantes-observados-suspendidos-form.html',
})
export class EstudiantesObservadosSuspendidosForm {
  private readonly servicio = inject(EstudiantesObservadosSuspendidosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPersona: [0, [Validators.required]],
      tipo: ['', [Validators.required]],
      motivo: ['', [Validators.required]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', []],
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
    const request = this.form.getRawValue() as EstudiantesObservadosSuspendidosRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/estudiantes-observados-suspendidos']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
