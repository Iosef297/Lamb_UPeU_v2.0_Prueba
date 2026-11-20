import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { TiposMatriculaRequest } from './tipos-matricula.model';
import { TiposMatriculaService } from './tipos-matricula-service';

@Component({
  selector: 'app-tipos-matricula-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tipos-matricula-form.html',
})
export class TiposMatriculaForm {
  private readonly servicio = inject(TiposMatriculaService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      descripcion: ['', []],
      activo: [false, []],
      articuloLegal: ['', []],
      creditosMinimos: [null as number | null, []],
      requierePago: [false, [Validators.required]],
      diasHabilesLimite: [null as number | null, []],
      maxVecesDesaprobado: [null as number | null, []],
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
    const request = this.form.getRawValue() as TiposMatriculaRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/tipos-matricula']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
