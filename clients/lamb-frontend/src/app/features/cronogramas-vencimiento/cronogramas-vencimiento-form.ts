import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { CronogramasVencimientoRequest } from './cronogramas-vencimiento.model';
import { CronogramasVencimientoService } from './cronogramas-vencimiento-service';

@Component({
  selector: 'app-cronogramas-vencimiento-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cronogramas-vencimiento-form.html',
})
export class CronogramasVencimientoForm {
  private readonly servicio = inject(CronogramasVencimientoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      periodo: ['', [Validators.required]],
      fechaVencimiento: ['', [Validators.required]],
      descripcion: ['', []],
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
    const request = this.form.getRawValue() as CronogramasVencimientoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/cronogramas-vencimiento']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
