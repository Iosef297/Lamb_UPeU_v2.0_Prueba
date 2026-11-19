import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admision-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing">
      <header class="top">
        <div class="brand">
          <div class="brand-chip">A</div>
          <span class="brand-text">A | UPeU · Admisión</span>
        </div>
      </header>

      <main class="hero">
        <h1>Admisión UPeU</h1>
        <p class="sub">Liderando con principios. Inicia tu postulación, consulta tu avance o paga tu derecho de admisión.</p>

        <div class="cards">
          <a routerLink="/admision/nueva-postulacion" class="card primary">
            <span class="material-symbols-outlined">edit_document</span>
            <h3>Postular</h3>
            <small>Registra tus datos y reserva tu código de postulante</small>
          </a>

          <a routerLink="/publico/seguimiento" class="card">
            <span class="material-symbols-outlined">search</span>
            <h3>Consultar postulación</h3>
            <small>Ingresa tu DNI y mira tu avance</small>
          </a>

          <a routerLink="/publico/pagar" class="card">
            <span class="material-symbols-outlined">payments</span>
            <h3>Pagar derecho de admisión</h3>
            <small>Yape, BCP o Mercado Pago</small>
          </a>
        </div>
      </main>

      <footer class="foot">UPeU Admisión</footer>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .landing {
      position: fixed; inset: 0;
      background:
        linear-gradient(180deg, rgba(20,27,68,.55), rgba(20,27,68,.82)),
        url('/graduados.jpg') center/cover no-repeat;
      color: #fff;
      display: flex;
      flex-direction: column;
      font-family: system-ui, sans-serif;
    }

    .top {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 2rem;
      background: rgba(0,0,0,.2);
    }
    .brand { display: flex; align-items: center; gap: .75rem; font-weight: 700; }
    .brand-chip {
      background: #ffb300; color: #003366;
      width: 32px; height: 32px; border-radius: 6px;
      display: grid; place-items: center; font-weight: 800;
    }

    .hero {
      flex: 1;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      padding: 2rem;
      text-align: center;
    }
    h1 { font-size: 3rem; margin: 0 0 .5rem; }
    .sub { max-width: 640px; opacity: .9; margin-bottom: 2.5rem; }

    .cards {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 280px));
      gap: 1.25rem; justify-content: center;
    }
    .card {
      background: rgba(255,255,255,.1);
      border: 1px solid rgba(255,255,255,.2);
      padding: 1.75rem 1.25rem;
      border-radius: 12px;
      color: #fff; text-decoration: none; text-align: center;
      cursor: pointer;
      transition: transform .15s, background .15s;
      display: flex; flex-direction: column; align-items: center; gap: .5rem;
      font-family: inherit;
    }
    .card:hover { transform: translateY(-4px); background: rgba(255,255,255,.18); }
    .card.primary { background: #ffb300; color: #003366; border: 0; }
    .card.primary:hover { background: #ffc233; }
    .card h3 { margin: 0; font-size: 1.15rem; }
    .card small { opacity: .85; font-size: .82rem; }
    .card .material-symbols-outlined { font-size: 2.5rem; }

    .foot {
      text-align: center; padding: 1rem; font-size: .85rem; opacity: .7;
      background: rgba(0,0,0,.2);
    }
  `]
})
export class AdmisionLandingComponent {}
