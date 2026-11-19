import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';

/** Datos de la sesion para la cabecera del diseño (nombre, iniciales, rol). */
@Injectable({ providedIn: 'root' })
export class SesionUi {
  readonly auth = inject(AuthService);

  readonly nombre = computed(() => this.auth.nombreUsuario() ?? 'Invitado');

  readonly iniciales = computed(() => {
    const partes = this.nombre()
      .replace(/[._-]+/g, ' ')
      .replace(/\d+/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const ini = partes.length > 1 ? partes[0][0] + partes[1][0] : (partes[0] ?? '?').slice(0, 2);
    return ini.toUpperCase();
  });

  readonly rol = computed(() => {
    const propios = this.auth.roles().filter((r) => ['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'].includes(r));
    const nombres: Record<string, string> = {
      ADMIN: 'Administrador',
      COORDINADOR: 'Coordinador académico',
      DOCENTE: 'Docente',
      ESTUDIANTE: 'Estudiante',
    };
    return propios.length ? propios.map((r) => nombres[r]).join(' · ') : 'Sin rol';
  });

  puedeEscribir(roles: string[]): boolean {
    return this.auth.tieneRol(...roles);
  }
}
