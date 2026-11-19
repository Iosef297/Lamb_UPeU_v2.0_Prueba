import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sin-acceso',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="wrap">
      <h1>Acceso no autorizado</h1>
      <p>No tienes permisos para acceder a este módulo.</p>
      <a routerLink="/">Volver al inicio</a>
    </div>
  `,
  styles: [`
    .wrap { max-width: 640px; margin: 4rem auto; padding: 1rem; font-family: system-ui; text-align: center; }
    h1 { color: #c00; }
  `]
})
export class SinAccesoComponent {}
