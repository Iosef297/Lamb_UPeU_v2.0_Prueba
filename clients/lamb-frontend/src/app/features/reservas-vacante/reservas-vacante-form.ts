import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { ReservasVacanteRequest } from './reservas-vacante.model';
import { ReservasVacanteService } from './reservas-vacante-service';

@Component({
  selector: 'app-reservas-vacante-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reservas-vacante-form.html',
})
export class ReservasVacanteForm {
  private readonly servicio = inject(ReservasVacanteService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idSeccion: [0, [Validators.required]],
      idPersona: [0, [Validators.required]],
      fechaReserva: ['', [Validators.required]],
      vigenciaHasta: ['', []],
      estado: ['', []],
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
    const request = this.form.getRawValue() as ReservasVacanteRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/reservas-vacante']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
