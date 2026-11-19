import { Component, input } from '@angular/core';

/** Iconos SVG del diseño (relleno solido, 24x24). */
@Component({
  selector: 'ac-icono',
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" [attr.width]="tam()" [attr.height]="tam()" aria-hidden="true">
      @switch (nombre()) {
        @case ('curriculo') {
          <path d="M11.7 2.8a1 1 0 0 1 .6 0l9 3.5a1 1 0 0 1 0 1.9l-9 3.5a1 1 0 0 1-.6 0l-9-3.5a1 1 0 0 1 0-1.9l9-3.5Z" />
          <path d="M5 10.6v4.2c0 .4.2.7.6.9 3.9 2.1 8.9 2.1 12.8 0 .4-.2.6-.5.6-.9v-4.2l-6.3 2.5a2 2 0 0 1-1.4 0L5 10.6Z" />
          <path d="M21 9.5a1 1 0 0 1 1 1V16a1 1 0 1 1-2 0v-5.5a1 1 0 0 1 1-1Z" />
        }
        @case ('planificacion') {
          <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z" />
          <path d="M7 12h3v3H7zM11 12h3v3h-3zM15 12h2v3h-2zM7 16h3v2H7zM11 16h3v2h-3z" />
        }
        @case ('evaluacion') {
          <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.4a2 2 0 0 0-.6-1.4l-4.4-4.4A2 2 0 0 0 13.6 2H6Zm9.7 9.3a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4 0l-2-2a1 1 0 1 1 1.4-1.4l1.3 1.3 3.3-3.3a1 1 0 0 1 1.4 0Z" />
        }
        @case ('usuario') {
          <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM4 20a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1Z" />
        }
        @case ('matricula') {
          <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9h-5a2 2 0 0 1-2-2V2H6Zm9 .4V7h4.6L15 2.4Z" />
        }
        @case ('check') {
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.7-5 5a1 1 0 0 1-1.4 0l-2.5-2.5a1 1 0 1 1 1.4-1.4l1.8 1.8 4.3-4.3a1 1 0 1 1 1.4 1.4Z" />
        }
        @case ('calendario') {
          <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z" />
        }
        @case ('salir') {
          <path d="M4 4a2 2 0 0 1 2-2h6a1 1 0 1 1 0 2H6v16h6a1 1 0 1 1 0 2H6a2 2 0 0 1-2-2V4Z" />
          <path d="M15.3 7.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4l2.3-2.3H9a1 1 0 1 1 0-2h8.6l-2.3-2.3a1 1 0 0 1 0-1.4Z" />
        }
      }
    </svg>
  `,
  host: { style: 'display:inline-flex' },
})
export class Icono {
  readonly nombre = input.required<string>();
  readonly tam = input(24);
}
