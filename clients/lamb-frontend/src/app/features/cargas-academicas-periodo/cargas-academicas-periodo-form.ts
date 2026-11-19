import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { CargasAcademicasPeriodoRequest } from './cargas-academicas-periodo.model';
import { CargasAcademicasPeriodoService } from './cargas-academicas-periodo-service';

@Component({
  selector: 'app-cargas-academicas-periodo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cargas-academicas-periodo-form.html',
})
export class CargasAcademicasPeriodoForm {
  private readonly servicio = inject(CargasAcademicasPeriodoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPersona: [0, [Validators.required]],
      periodo: ['', [Validators.required]],
      totalCreditos: [0, [Validators.required]],
      totalCursos: [0, [Validators.required]],
      fechaCalculo: ['', [Validators.required]],
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
    const request = this.form.getRawValue() as CargasAcademicasPeriodoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/cargas-academicas-periodo']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
