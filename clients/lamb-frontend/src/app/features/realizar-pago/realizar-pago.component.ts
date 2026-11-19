import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-realizar-pago',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="wrap">
      <h1>Realizar pago</h1>
      <p>
        Los pagos se procesan a través de la pasarela de pago institucional. Consulta tu
        <a routerLink="/estado-cuenta">estado de cuenta</a> para ver tu deuda pendiente antes de continuar con el pago.
      </p>
    </div>
  `,
  styles: [`
    .wrap { max-width: 640px; margin: 2rem auto; padding: 1rem; font-family: system-ui; }
    h1 { color: #003366; }
  `]
})
export class RealizarPagoComponent {}
