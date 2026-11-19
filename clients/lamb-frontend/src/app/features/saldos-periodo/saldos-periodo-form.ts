import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { SaldosPeriodoRequest } from './saldos-periodo.model';
import { SaldosPeriodoService } from './saldos-periodo-service';

@Component({
  selector: 'app-saldos-periodo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './saldos-periodo-form.html',
})
export class SaldosPeriodoForm {
  private readonly servicio = inject(SaldosPeriodoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPersona: [0, [Validators.required]],
      periodo: ['', [Validators.required]],
      saldoInicial: [0, []],
      saldoFinal: [0, []],
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
    const request = this.form.getRawValue() as SaldosPeriodoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/saldos-periodo']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
