import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { CrucesHorarioAutorizadosRequest } from './cruces-horario-autorizados.model';
import { CrucesHorarioAutorizadosService } from './cruces-horario-autorizados-service';

@Component({
  selector: 'app-cruces-horario-autorizados-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cruces-horario-autorizados-form.html',
})
export class CrucesHorarioAutorizadosForm {
  private readonly servicio = inject(CrucesHorarioAutorizadosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idMatricula: [0, [Validators.required]],
      idSeccion1: [0, [Validators.required]],
      idSeccion2: [0, [Validators.required]],
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
    const request = this.form.getRawValue() as CrucesHorarioAutorizadosRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/cruces-horario-autorizados']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
