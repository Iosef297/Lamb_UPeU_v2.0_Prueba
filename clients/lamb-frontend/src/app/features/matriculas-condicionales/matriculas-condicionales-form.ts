import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { MatriculasCondicionalesRequest } from './matriculas-condicionales.model';
import { MatriculasCondicionalesService } from './matriculas-condicionales-service';

@Component({
  selector: 'app-matriculas-condicionales-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './matriculas-condicionales-form.html',
})
export class MatriculasCondicionalesForm {
  private readonly servicio = inject(MatriculasCondicionalesService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idMatricula: [0, [Validators.required]],
      motivo: ['', [Validators.required]],
      fechaCondicion: ['', [Validators.required]],
      levantada: [false, []],
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
    const request = this.form.getRawValue() as MatriculasCondicionalesRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/matriculas-condicionales']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
