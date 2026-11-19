import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/http/mensaje-error';
import { DatosFacturacionClienteRequest } from './datos-facturacion-cliente.model';
import { DatosFacturacionClienteService } from './datos-facturacion-cliente-service';

@Component({
  selector: 'app-datos-facturacion-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './datos-facturacion-cliente-form.html',
})
export class DatosFacturacionClienteForm {
  private readonly servicio = inject(DatosFacturacionClienteService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly error = signal<string | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id');

  protected readonly form = this.fb.group({
      idPersona: [0, [Validators.required]],
      razonSocial: ['', []],
      numeroDocumento: ['', [Validators.required]],
      direccion: ['', []],
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
    const request = this.form.getRawValue() as DatosFacturacionClienteRequest;
    const obs = this.id
      ? this.servicio.actualizar(Number(this.id), request)
      : this.servicio.crear(request);
    obs.subscribe({
      next: () => this.router.navigate(['/datos-facturacion-cliente']),
      error: (err) => this.error.set(mensajeError(err, 'No se pudo guardar el registro.')),
    });
  }
}
