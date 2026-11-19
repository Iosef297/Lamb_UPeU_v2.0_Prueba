import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth/auth-service';
import { CRUDS, CRUD_BY_SLUG } from '../features/cruds.catalog';

type ModuleKey = 'Admisión' | 'Trayectoria' | 'Institucional' | 'Personas' | 'Currículo' | 'Finanzas';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  initials = computed(() => {
    const nombre = this.auth.nombreUsuario();
    if (!nombre) return 'NL';
    const limpio = nombre.replace(/[._]/g, ' ').trim();
    const partes = limpio.split(/\s+/).filter(Boolean);
    if (partes.length === 0) return 'NL';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  });

  collapsed = signal(false);
  private url = signal(this.router.url);

  // Módulo activo según la URL
  activeModule = computed<ModuleKey | null>(() => {
    const u = this.url();
    if (u.startsWith('/trayectoria')) return 'Trayectoria';
    if (u.startsWith('/admision')) return 'Admisión';
    const match = u.match(/^\/crud\/([^/?#]+)/);
    if (match) {
      const def = CRUD_BY_SLUG.get(match[1]);
      if (def) return def.group;
    }
    return null;
  });

  admision      = computed(() => CRUDS.filter(c => c.group === 'Admisión' && !c.hidden));
  trayectoria   = computed(() => CRUDS.filter(c => c.group === 'Trayectoria' && !c.hidden));
  institucional = computed(() => CRUDS.filter(c => c.group === 'Institucional' && !c.hidden));
  personas      = computed(() => CRUDS.filter(c => c.group === 'Personas' && !c.hidden));
  curriculo     = computed(() => CRUDS.filter(c => c.group === 'Currículo' && !c.hidden));
  finanzas      = computed(() => CRUDS.filter(c => c.group === 'Finanzas' && !c.hidden));

  showAdmision      = computed(() => this.activeModule() === 'Admisión');
  showTrayectoria   = computed(() => this.activeModule() === 'Trayectoria');
  showInstitucional = computed(() => this.activeModule() === 'Institucional');
  showPersonas      = computed(() => this.activeModule() === 'Personas');
  showCurriculo     = computed(() => this.activeModule() === 'Currículo');
  showFinanzas      = computed(() => this.activeModule() === 'Finanzas');

  // Grupos grandes (Institucional/Personas) se dividen en subgrupos colapsables
  // para no mostrar 40+ links sueltos en el sidebar.
  private agrupar(items: ReturnType<typeof computed<any[]>>) {
    return computed(() => {
      const out: { subgroup: string; items: any[] }[] = [];
      for (const item of (items as any)()) {
        const key = item.subgroup ?? 'Otros';
        let bucket = out.find(b => b.subgroup === key);
        if (!bucket) { bucket = { subgroup: key, items: [] }; out.push(bucket); }
        bucket.items.push(item);
      }
      return out;
    });
  }

  institucionalGrouped = this.agrupar(this.institucional);
  personasGrouped      = this.agrupar(this.personas);
  curriculoGrouped     = this.agrupar(this.curriculo);
  finanzasGrouped      = this.agrupar(this.finanzas);

  // undefined = sin override, usa el default (abierto si contiene el item activo)
  private subgroupOverrides = signal(new Map<string, boolean>());

  activeSlug = computed(() => {
    const match = this.url().match(/^\/crud\/([^/?#]+)/);
    return match ? match[1] : null;
  });

  isSubgroupOpen(subgroup: string, items: any[]): boolean {
    const override = this.subgroupOverrides().get(subgroup);
    if (override !== undefined) return override;
    return items.some(i => i.slug === this.activeSlug());
  }

  toggleSubgroup(subgroup: string, items: any[]) {
    const actual = this.isSubgroupOpen(subgroup, items);
    this.subgroupOverrides.update(map => {
      const next = new Map(map);
      next.set(subgroup, !actual);
      return next;
    });
  }

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.url.set(e.urlAfterRedirects));
  }

  toggle() { this.collapsed.update(v => !v); }
  logout() { this.auth.cerrarSesion(); }
}
