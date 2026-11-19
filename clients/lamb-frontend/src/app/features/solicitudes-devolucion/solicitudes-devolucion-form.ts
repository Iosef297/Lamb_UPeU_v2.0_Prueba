import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { SolicitudesDevolucionRequest } from './solicitudes-devolucion.model';
import { SolicitudesDevolucionService } from './solicitudes-devolucion-service';

@Component({
  selector: 'app-solicitudes-devolucion-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './solicitudes-devolucion-form.html',
})
export class SolicitudesDevolucionForm {
  private readonly servicio = inject(SolicitudesDevolucionService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPersona: [0, [Validators.required]],
      motivo: ['', [Validators.required]],
      montoSolicitado: [0, [Validators.required]],
      estado: ['', []],
      fechaSolicitud: ['', [Validators.required]],
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
    const request = this.form.getRawValue() as SolicitudesDevolucionRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/solicitudes-devolucion']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
