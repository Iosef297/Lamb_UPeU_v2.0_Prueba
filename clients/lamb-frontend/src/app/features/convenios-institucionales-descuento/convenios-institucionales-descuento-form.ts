import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { ConveniosInstitucionalesDescuentoRequest } from './convenios-institucionales-descuento.model';
import { ConveniosInstitucionalesDescuentoService } from './convenios-institucionales-descuento-service';

@Component({
  selector: 'app-convenios-institucionales-descuento-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './convenios-institucionales-descuento-form.html',
})
export class ConveniosInstitucionalesDescuentoForm {
  private readonly servicio = inject(ConveniosInstitucionalesDescuentoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      institucion: ['', [Validators.required]],
      porcentaje: [0, [Validators.required]],
      vigenteDesde: ['', []],
      vigenteHasta: ['', []],
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
    const request = this.form.getRawValue() as ConveniosInstitucionalesDescuentoRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/convenios-institucionales-descuento']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
