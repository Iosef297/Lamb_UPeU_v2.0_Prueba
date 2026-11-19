# Módulo B-Learning (Frontend)

Responsable frontend: Cristofer.
Backend (`lamb-lms-ms`): responsable el compañero de backend.

Este documento describe **qué vamos a construir en el front** para el módulo B-Learning, independiente del avance del backend. Mientras el backend no esté listo, el front trabaja con **mocks** (fixtures en TS) y queda listo para enchufar los endpoints reales cuando existan.

---

## 1. Referencia visual

Se replica el patrón del B-Learning actual de la UPeU (`https://upeu.icrmedu.com/B-Learning/Paginas/PA_CursosAlumno.aspx`) porque es el flujo que el estudiante ya conoce.

Arquitectura de **3 niveles**:

1. **Portal del estudiante** → grid de cursos del período + widgets laterales (sesiones de hoy, pendientes, comunicados).
2. **Interior del curso** → sidebar con unidades + tabs (Unidades / Compañeros / General).
3. **Interior de la unidad** → acordeones (productos, tareas, evaluaciones, recursos, rutas, encuestas) + sub-tabs (sesiones, tareas, más).

---

## 2. Rutas

```
/b-learning                              Portal (Nivel 1)
/b-learning/curso/:id                    Shell del curso (Nivel 2)
/b-learning/curso/:id/unidad/:uid        Unidad (Nivel 3)
/b-learning/curso/:id/sesion/:sid        Detalle de sesión
/b-learning/curso/:id/tarea/:tid         Entrega de tarea
/b-learning/admin                        (Futuro) CRUDs de configuración, protegido por rol
```

Agregar `BLearningRoutes` cargado por lazy-loading desde `app.routes.ts`.

---

## 3. Componentes a crear

Carpeta: `src/app/features/b-learning/`

| Componente | Nivel | Qué hace |
|---|---|---|
| `PortalCursosComponent` | 1 | Selector de período + grid de cursos + panel lateral |
| `CursoCardComponent` | 1 | Card individual de curso (banner, nombre, programa, docente) |
| `SesionesHoyWidget` | 1 | Widget "Sesiones de hoy" |
| `PendientesWidget` | 1 | Widget "Mis pendientes" + botón mapa de cumplimiento |
| `ComunicadosWidget` | 1 | Widget "Comunicados" |
| `CursoShellComponent` | 2 | Layout del curso: sidebar + router-outlet + tabs |
| `CursoSidebarComponent` | 2 | Lista de unidades (U1, U2, U3…) |
| `UnidadDetalleComponent` | 3 | Acordeones + sub-tabs de sesiones/tareas |
| `SesionCardComponent` | 3 | Card de sesión (nº, fecha, duración, título) |
| `TareaItemComponent` | 3 | Ítem de tarea con fecha y botón "entregar" |
| `MapaCumplimientoComponent` | - | Vista del progreso del estudiante |

---

## 4. Servicios

Carpeta: `src/app/features/b-learning/services/`

- `BLearningApi` → wrapper sobre `ApiService` apuntando a `/api/v1/lms/...`
- `PortalMockService` → devuelve fixtures mientras el backend no esté arriba
- Interface común `IBLearningSource` para poder alternar mock/real con un flag en `environment.ts`

---

## 5. Mocks (para desarrollar sin backend)

Carpeta: `src/app/features/b-learning/mocks/`

- `cursos.mock.ts` → 7 cursos del período 2026-2 (como el ejemplo real).
- `periodos.mock.ts` → 2026-2, 2026-1, 2025-2, 2025-1, 2024-2.
- `sesiones.mock.ts` → sesiones de hoy + sesiones por unidad.
- `tareas.mock.ts` → tareas pendientes.
- `comunicados.mock.ts` → vacío + 1 ejemplo con anuncio.

---

## 6. Endpoints esperados del backend (contrato)

Esto es lo que el backend `lamb-lms-ms` debería exponer. Se comparte con el compañero backend para alinear.

| Método | Ruta | Devuelve |
|---|---|---|
| `GET` | `/periodos-academicos` | Lista de períodos |
| `GET` | `/cursos?periodoId=&estudianteId=` | Cursos del estudiante en el período |
| `GET` | `/cursos/:id` | Detalle del curso (nombre, programa, ciclo, docente, descripción) |
| `GET` | `/cursos/:id/unidades` | Unidades del curso |
| `GET` | `/unidades/:uid` | Detalle de unidad |
| `GET` | `/unidades/:uid/sesiones` | Sesiones de la unidad |
| `GET` | `/unidades/:uid/tareas` | Tareas de la unidad |
| `GET` | `/unidades/:uid/evaluaciones` | Evaluaciones |
| `GET` | `/unidades/:uid/recursos` | Recursos complementarios |
| `GET` | `/sesiones?fecha=hoy&estudianteId=` | Sesiones de hoy |
| `GET` | `/tareas/pendientes?estudianteId=` | Pendientes del estudiante |
| `GET` | `/anuncios?estudianteId=` | Comunicados |
| `GET` | `/estudiantes/:id/mapa-cumplimiento` | Datos del mapa |
| `POST` | `/entregas-tarea` | Entregar una tarea |

Todos estos ya existen como controllers en `services/lamb-lms-ms/src/main/java/.../controller/` — solo falta confirmar que los contratos (DTOs y shape de respuesta) coincidan.

---

## 7. Plan de trabajo (orden)

- [ ] **P0** — Tile "B-LEARNING" en el home ya está agregado (`home.component.ts`).
- [ ] **P1** — Crear ruta `/b-learning` y `PortalCursosComponent` con mocks.
- [ ] **P2** — `CursoCardComponent` + `SesionesHoyWidget` + `PendientesWidget` + `ComunicadosWidget`.
- [ ] **P3** — Selector de período funcional (cambia el grid).
- [ ] **P4** — `CursoShellComponent` + sidebar + tabs Unidades/Compañeros/General.
- [ ] **P5** — `UnidadDetalleComponent` con acordeones y grid de sesiones.
- [ ] **P6** — Vista de sesión individual (playlist/contenido).
- [ ] **P7** — Vista de entrega de tarea (form + archivo adjunto).
- [ ] **P8** — `MapaCumplimientoComponent`.
- [ ] **P9** — Conectar con backend real (reemplazar `PortalMockService` por `BLearningApi`).
- [ ] **P10** — Zona `/b-learning/admin` con CRUDs de configuración (categorías, modalidades, insignias, etc.) por rol.

---

## 8. Convenciones

- **Patrón visual**: respetar look & feel del shell principal (`src/app/layout/shell.component.ts`) — fondo oscuro top bar, tiles con estética UPeU.
- **Standalone components + signals** (Angular 21, ya es el patrón del proyecto).
- **Sin NgModules.**
- **Estilos**: TailwindCSS (ya instalado) + Angular Material cuando aplique.
- **Auth**: rutas protegidas con `authGuard` existente (`core/auth/auth-guard.ts`); vistas admin con `rolGuard`.

---

## 9. Dudas pendientes de resolver con el equipo

1. ¿El B-Learning debe atender también la vista del **docente** (pasar asistencia, calificar), o es solo estudiante en v1?
2. ¿Los recursos (PDFs, videos) se almacenan en el LMS o en un storage externo (S3, Azure Blob)?
3. ¿Las encuestas de satisfacción las maneja `lms-ms` o hay otro servicio?
4. ¿La ruta `/b-learning/admin` requiere un rol nuevo (`LMS_ADMIN`) o reusa `ADMIN`?
