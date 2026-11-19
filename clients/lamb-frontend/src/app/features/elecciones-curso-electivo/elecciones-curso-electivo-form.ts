import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { EleccionesCursoElectivoRequest } from './elecciones-curso-electivo.model';
import { EleccionesCursoElectivoService } from './elecciones-curso-electivo-service';

@Component({
  selector: 'app-elecciones-curso-electivo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './elecciones-curso-electivo-form.html',
})
export class EleccionesCursoElectivoForm {
  private readonly servicio = inject(EleccionesCursoElectivoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPersona: [0, [Validators.required]],
      idCurso: [0, [Validators.required]],
      periodo: ['', [Validators.required]],
      fechaEleccion: ['', [Validators.required]],
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
    const request = this.form.getRawValue() as EleccionesCursoElectivoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/elecciones-curso-electivo']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
