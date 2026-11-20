# Lamb UPeU v2.0

Sistema distribuido académico-administrativo de la Universidad Peruana Unión — proyecto **Lamb UPeU v2.0** (admisión, matrícula, finanzas, LMS, trayectoria y módulos de apoyo).

## Documentación

La documentación del proyecto (guías, arquitectura, sesiones de trabajo) vive en [`docs/`](docs/) y se publica como sitio con MkDocs (ver [`mkdocs.yml`](mkdocs.yml)).

Documentos complementarios en la raíz:

- [`B-LEARNING.md`](B-LEARNING.md) — notas del módulo B-Learning.
- [`SESION-2026-11-19.md`](SESION-2026-11-19.md) — bitácora de la última sesión.
- [`CONTEXTO_SESION.md`](CONTEXTO_SESION.md) — contexto operativo.

## Estructura del repositorio

```text
Lamb_UPeU_v2.0_Prueba/
├── docs/                         # Documentación (MkDocs)
├── infra/                        # Infraestructura que los microservicios necesitan para funcionar
│   ├── lamb-config/               # Config Server (perfil native, config-repo/ local)
│   ├── lamb-eureka/               # Registro y descubrimiento de servicios
│   ├── lamb-gateway/              # Punto único de acceso y ruteo
│   └── compose.yml                # Stack de infraestructura
├── services/                     # Microservicios de negocio
│   ├── lamb-personas-ms/          # Personas (persona natural, identidades)
│   ├── lamb-institucional-ms/     # Catálogo institucional (facultades, EP, sedes)
│   ├── lamb-planificacion-ms/     # Planificación académica
│   ├── lamb-admision-ms/          # Admisión (postulación, Brevo mail)
│   ├── lamb-matricula-ms/         # Matrícula (selector tipo/modalidad)
│   ├── lamb-evaluacion-ms/        # Evaluación académica
│   ├── lamb-finanzas-ms/          # Finanzas (consolidado con ingresos-pagos)
│   ├── lamb-curriculo-ms/         # Currículo y planes de estudio
│   ├── lamb-trayectoria-ms/       # Trayectoria estudiantil
│   ├── lamb-lms-ms/               # LMS / B-Learning
│   └── lamb-ingresos-pagos-ms/    # Ingresos y pagos (Mercado Pago)
├── keycloak/                     # Keycloak + Postgres (servidor de autorización)
├── kafka/                        # Kafka y Kafka UI (mensajería)
├── obs/                          # Prometheus + Loki + Promtail + Grafana
├── clients/
│   └── lamb-frontend/             # Frontend Angular (home con 11 módulos, paleta UPeU)
└── scripts/                      # Scripts de apoyo
```

## Requisitos

- JDK 21
- Docker Desktop (en DEV, para PostgreSQL, Kafka, Keycloak y la observabilidad)
- Git
- No hace falta instalar Maven: cada proyecto trae Maven Wrapper (`mvnw`/`mvnw.cmd`)
- Node.js 20+ y Angular CLI (solo para el frontend en `clients/lamb-frontend/`)

## Arranque rápido en DEV

El **orden importa**: primero la infraestructura, después los servicios. Cada aplicación corre en su propia terminal, parada en la carpeta indicada. Los comandos son de PowerShell; en macOS/Linux, `.\mvnw.cmd` es `./mvnw`.

**1. Infraestructura**

```powershell
cd infra/lamb-config
.\mvnw.cmd spring-boot:run
```

```powershell
cd infra/lamb-eureka
.\mvnw.cmd spring-boot:run
```

```powershell
cd infra/lamb-gateway
.\mvnw.cmd spring-boot:run
```

**2. Kafka** — los servicios que publican/consumen eventos (p. ej. `lamb-ingresos-pagos-ms` con Mercado Pago, `lamb-admision-ms` con Brevo) se conectan por el puerto externo (`localhost:19092`) en DEV. Se levanta primero para que el orden sea el mismo en DEV y en PROD local:

```powershell
cd kafka
docker compose -f compose-dev.yml up -d
```

Verifica en `http://localhost:18085` (Kafka UI) que el clúster aparece conectado.

**3. Keycloak** — servidor de autorización (OIDC/PKCE):

```powershell
cd keycloak
docker compose -f compose-dev.yml up -d
```

Verifica en `http://localhost:18180` que la consola de administración de Keycloak responde (`admin`/`admin123`).

**4. Servicios** — la base de datos primero (cada servicio con su propio `compose-dev.yml`), después la aplicación. Cada microservicio toma su configuración de `lamb-config` (`config-repo/<servicio>-dev.yml`):

```powershell
cd services/lamb-personas-ms
docker compose -f compose-dev.yml up -d
.\mvnw.cmd spring-boot:run
```

```powershell
cd services/lamb-institucional-ms
docker compose -f compose-dev.yml up -d
.\mvnw.cmd spring-boot:run
```

Repite el patrón con el resto de microservicios según los módulos que necesites levantar (`lamb-planificacion-ms`, `lamb-admision-ms`, `lamb-matricula-ms`, `lamb-evaluacion-ms`, `lamb-finanzas-ms`, `lamb-curriculo-ms`, `lamb-trayectoria-ms`, `lamb-lms-ms`, `lamb-ingresos-pagos-ms`).

**5. Frontend (Angular)**

```powershell
cd clients/lamb-frontend
npm install
npm start
```

Disponible en `http://localhost:4200` — home con los 11 módulos, B-Learning inicial y sidebars por módulo, paleta UPeU unificada.

**6. Verificar**

- Dashboard de Eureka: `http://localhost:18761`. Deben aparecer los servicios registrados.
- Una llamada a través del Gateway:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:18080/api/v1/personas"
```

**7. Observabilidad (opcional)** — solo si necesitas dashboards/trazas/logs centralizados. Si Docker ya va lento, es el primer stack que puedes dejar abajo:

```powershell
cd obs
docker compose -f compose-dev.yml up -d
```

## Detener

`Ctrl+C` detiene cada microservicio en su propia terminal. Para los contenedores, cada carpeta con su propio `compose-dev.yml` (`kafka/`, `keycloak/`, cada `services/lamb-*-ms/`, `obs/`) baja solo los suyos con `docker compose -f compose-dev.yml down`.

Todos los contenedores de Lamb se nombran con el prefijo `lamb-` — para pararlos todos juntos sin entrar carpeta por carpeta:

```powershell
docker stop (docker ps --filter "name=lamb-" -q)
```

```bash
docker stop $(docker ps --filter "name=lamb-" -q)
```

Si tienes **otros proyectos** corriendo en paralelo y necesitas liberar memoria, para absolutamente todo lo que esté corriendo en Docker:

```powershell
docker stop (docker ps -q)
```

```bash
docker stop $(docker ps -q)
```

`docker stop` (no `down`): deja los contenedores creados, listos para un `docker start (docker ps -a --filter "name=lamb-" -q)` rápido la próxima vez, en vez de recrearlos desde cero con `compose up`.

## Puertos en DEV

| Componente | Puerto (host) |
|---|---|
| `lamb-config` | `18888` |
| `lamb-eureka` | `18761` |
| `lamb-gateway` | `18080` |
| `lamb-personas-ms` | `8081` |
| `lamb-institucional-ms` | `8082` |
| `lamb-planificacion-ms` | `8083` |
| `lamb-admision-ms` | `8084` |
| `lamb-matricula-ms` | `8085` |
| `lamb-evaluacion-ms` | `8086` |
| `lamb-finanzas-ms` | `8087` |
| `lamb-curriculo-ms` | `8088` |
| `lamb-trayectoria-ms` | `8089` |
| `lms-ms` (`lamb-lms-ms`) | `8181` |
| `ingresos-pagos-ms` (`lamb-ingresos-pagos-ms`) | `8182` |
| Keycloak HTTP / management | `18180` / `19000` |
| Kafka broker / Kafka UI | `19092` / `18085` |
| Prometheus / Loki / Grafana | `19090` / `13100` / `13000` |
| Angular frontend | `4200` |

## Arquitectura

Spring Cloud Config (perfil `native`, `config-repo/` local) provee la configuración por servicio; Eureka para descubrimiento y Gateway como punto único de acceso. Keycloak como servidor OIDC para el login PKCE desde el frontend Angular. Kafka para eventos (pagos, notificaciones por Brevo).

Diagramas y detalle adicional en [`docs/`](docs/).

## Tecnologías

- Java 21, Spring Boot, Spring Cloud (Config, Eureka, Gateway)
- Spring Security con Keycloak/OIDC
- PostgreSQL, Flyway (migraciones versionadas), MapStruct
- Kafka (mensajería de eventos)
- Prometheus, Loki, Grafana (observabilidad)
- Docker / Docker Compose
- Angular con login PKCE contra Keycloak
- Integraciones: Mercado Pago (pasarela de pagos), Brevo (correo transaccional)
