import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { CambiosSituacionAcademicaRequest } from './cambios-situacion-academica.model';
import { CambiosSituacionAcademicaService } from './cambios-situacion-academica-service';

@Component({
  selector: 'app-cambios-situacion-academica-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cambios-situacion-academica-form.html',
})
export class CambiosSituacionAcademicaForm {
  private readonly servicio = inject(CambiosSituacionAcademicaService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idSituacionAcademica: [0, [Validators.required]],
      situacionAnterior: ['', []],
      situacionNueva: ['', [Validators.required]],
      resolucion: ['', [Validators.required]],
      fechaCambio: ['', [Validators.required]],
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
    const request = this.form.getRawValue() as CambiosSituacionAcademicaRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/cambios-situacion-academica']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
