# PLAN DE TRABAJO — UrbanFlow Technologies Ltda.
## Quinta Hackatón · Tercera Evaluación Semestral · 02/06/2026

---

## 1. RESUMEN EJECUTIVO

**Objetivo:** Construir la Plataforma Inteligente de Movilidad Urbana para una metrópolis de >5M habitantes, integrando en tiempo real buses, metro, micro-movilidad, semáforos inteligentes y un sistema de pagos unificado.

**Arquitectura obligatoria:** Microservicios + Event Streaming (Upstash Kafka) + Persistencia Políglota.

**Stack tecnológico aprobado (Free-Tier):**
| Componente | Tecnología |
|---|---|
| Event Streaming | Upstash Kafka |
| Grafo multimodal | Neo4j AuraDB |
| Pagos / Telemetría | Supabase (PostgreSQL) |
| Micro-movilidad | MongoDB Atlas M0 + Upstash Redis |
| Despliegue | Render / Railway |
| Data Lake | Supabase Storage + DuckDB-Wasm |

---

## 2. ESTRUCTURA DEL EQUIPO (5 DESARROLLADORES)

### Dev 1 — Lead Platform, Ingest & DevOps (Go + Kafka)
- Monorepo scaffold + `docker-compose.yml` local
- `services/telemetry-ingest-ms` (Go): servidor UDP/HTTP → Upstash Kafka
- Esquemas compartidos en `shared-schemas/`

### Dev 2 — Core Transactions & Payments (NestJS + PostgreSQL)
- `services/unified-payment-ms` (NestJS/TypeScript)
- Esquema relacional ACID en Supabase (accounts, payment_transactions)
- Trigger de crypto-ledger (`regulatory_audit_ledger`) + SHA-256 chaining

### Dev 3 — Routing Engine & Shared Mobility (Python + Neo4j + Redis)
- `services/routing-engine-ms` (FastAPI/Python): algoritmo A* multimodal sobre Neo4j
- `services/shared-mobility-ms` (Node/Express): reservas con bloqueo Redis `SET NX PX`
- Modelo de grafo: nodos TransitStation, MicroMobilityHub, Intersection

### Dev 4 — Data Science, ML & Analytics (Python + DuckDB)
- `services/congestion-predictor-ms` (FastAPI/Scikit-Learn): consume `telemetry.raw.gps`
- Modelo autorregresivo: D(t+30) = θ₀ + Σθᵢ·Vₜ₋ᵢ + μ·Clima
- Exportación Parquet → Supabase Storage + consultas DuckDB-Wasm en el cliente

### Dev 5 — Bridge, Notifications & Frontend (TypeScript + WebSockets)
- `services/traffic-light-bridge-ms` (TypeScript): JSON → buffer binario UDP NTCIP <256 bytes
- `services/notification-ms` (Node/WebSockets): SSE para alertas en tiempo real
- Dashboard React mínimo: visualización SSE + estado del simulador

---

## 3. MVPS Y CRITERIOS DE ACEPTACIÓN

### MVP 1 — Núcleo de Movilidad y Pagos (60%)
**Componentes:** `telemetry-ingest-ms`, `routing-engine-ms`, `unified-payment-ms`

| Validación | Criterio |
|---|---|
| 1.1 | Ruta multimodal (metro + scooter + caminata) con Cmon y ECO2 calculados |
| 1.2 | GPS simulado → arribo exacto actualizado en cliente sin recarga (< 500ms) |
| 1.3 | Cobro con saldo insuficiente → rollback transaccional, balance intacto |

**RFs cubiertos:** RF-01 (rutas multimodales), RF-02 (rastreo GPS), RF-03 (pago unificado)

---

### MVP 2 — Tráfico Vial y Micro-movilidad (70%)
**Componentes:** `traffic-light-bridge-ms`, `shared-mobility-ms`

| Validación | Criterio |
|---|---|
| 2.1 | Paquete UDP NTCIP binario < 256 bytes verificable con sniffer |
| 2.2 | Reserva concurrente del mismo scooter → primero OK, segundo rechazado (Redis NX) |

**RFs cubiertos:** RF-04 (semáforos inteligentes), RF-05 (micro-movilidad)
**Restricción C-01:** mensajes NTCIP ≤ 256 bytes sobre red 4G celular privada

---

### MVP 3 — Inteligencia Predictiva y Alertas (80%)
**Componentes:** `congestion-predictor-ms`, `notification-ms`, panel Analytics

| Validación | Criterio |
|---|---|
| 3.1 | Predictor detecta congestión con 30 min de antelación (umbral D > 85%) |
| 3.2 | Ciudadanos en ruta afectada reciben push WebSocket con alternativa |
| 3.3 | Consulta DuckDB-Wasm sobre datos históricos Parquet resuelta < 2 segundos |

**RFs cubiertos:** RF-06 (predicción/re-enrutamiento), RF-07 (notificaciones push), RF-08 (KPIs alcaldía)

---

### MVP 4 — Cumplimiento Regulatorio e Inmutabilidad (100%)
**Componentes:** `regulatory_audit_ledger` (trigger PostgreSQL)

| Validación | Criterio |
|---|---|
| 4.1 | Registrar cambio de tarifa + evento de desvío de buses en el ledger |
| 4.2 | Modificar fila histórica → sistema detecta rotura de cadena de hashes SHA-256 |

**Restricción C-02:** Trazabilidad completa e inmutable para auditoría regulatoria trimestral

---

## 4. PLAN DE SPRINTS (Hackatón 18:30–20:45)

### FASE 0 — Scaffold y Contratos (18:30–18:45) — Dev 1
- [ ] Crear estructura de directorios completa del monorepo
- [ ] Generar `docker-compose.yml` raíz (Postgres local, Redis, MongoDB emulados)
- [ ] Generar `.env.example` unificado
- [ ] Escribir esquemas Avro/JSON en `shared-schemas/kafka/`
- [ ] Escribir `.proto` NTCIP en `shared-schemas/proto/`

### FASE 1 — Esqueletos + Mocks (18:45–19:15) — Todos los Devs en paralelo
- [ ] **Dev 1:** `telemetry-ingest-ms/cmd/server/main.go` (servidor UDP puerto 8080 + HTTP)
- [ ] **Dev 2:** `unified-payment-ms/src/payments/payments.service.ts` (transacción ACID stub)
- [ ] **Dev 3:** `routing-engine-ms/app/api/routes.py` (endpoint POST /v1/routes/calculate con mock)
- [ ] **Dev 4:** `congestion-predictor-ms/app/main.py` (API de diagnóstico con modelo mock)
- [ ] **Dev 5:** `traffic-light-bridge-ms/src/ntcip/encoder.ts` (serialización binaria NTCIP)

### FASE 2 — Implementación Core MVP 1 (19:15–19:45)
- [ ] **Dev 1:** `kafka/producer.go` — publicación asíncrona a `telemetry.raw.gps`
- [ ] **Dev 2:** Schema SQL completo (accounts, payment_transactions, triggers ACID)
- [ ] **Dev 3:** `algorithms.py` — A* sobre Neo4j con función W = α·T + β·C + γ·E
- [ ] **Dev 2:** `accounts.controller.ts` — endpoints balance y recarga

### FASE 3 — MVP 2 + Integración Kafka (19:45–20:10)
- [ ] **Dev 5:** `traffic-light-bridge-ms/src/kafka/consumer.ts` — consume `bus.reroute.command`
- [ ] **Dev 5:** `ntcip/udp_client.ts` — transmisión UDP al controlador físico
- [ ] **Dev 3:** `shared-mobility-ms` — reserva con Redis `SET NX PX 60000`
- [ ] **Dev 3:** MongoDB Atlas — índice 2dsphere en `current_location`

### FASE 4 — MVP 3 + MVP 4 (20:10–20:35)
- [ ] **Dev 4:** `stream_listener.py` — consume Kafka, calcula densidad, publica si D > 85%
- [ ] **Dev 4:** Exportación Parquet → Supabase Storage
- [ ] **Dev 5:** `notification-ms` — WebSocket SSE segmentado por ruta activa del ciudadano
- [ ] **Dev 2:** `regulatory_audit_ledger` + trigger SHA-256 encadenado

### FASE 5 — Dashboard, Integración Final y Demo (20:35–20:45)
- [ ] **Dev 5:** Dashboard React mínimo (mapa SSE + KPIs alcaldía)
- [ ] **Dev 4:** Queries DuckDB-Wasm validados en < 2 segundos
- [ ] **Todos:** Prueba de flujo completo de re-enrutamiento < 10 segundos end-to-end
- [ ] Verificar todos los criterios de aceptación de los 4 MVPs

---

## 5. PRÁCTICAS DE INGENIERÍA (CERO BLOQUEOS)

### API-First desde el Día 0
- Cada microservicio expone un mock que devuelve datos estáticos con el formato del contrato
- Los mocks permiten que el resto del equipo consuma sin esperar implementación real
- Contratos definidos en OpenAPI (REST) y AsyncAPI (Kafka topics)

### Branching Strategy (Trunk-Based)
```
main
├── feature/dev1-telemetry-ingest
├── feature/dev2-payments-acid
├── feature/dev3-routing-engine
├── feature/dev4-congestion-ml
└── feature/dev5-ntcip-bridge
```
- PRs auto-contenidos, 1 aprobación cruzada mínima
- Linter + tests automatizados antes de merge

### Variables de Entorno (`.env.example`)
```env
# Kafka
UPSTASH_KAFKA_BROKERS=
UPSTASH_KAFKA_USERNAME=
UPSTASH_KAFKA_PASSWORD=

# Neo4j AuraDB
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_DB_URL=

# MongoDB Atlas
MONGODB_URI=

# Upstash Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
```

### Desacoplamiento mediante Interfaces
- Todas las llamadas a hardware IoT (semáforos) envueltas en patrón Adapter
- Permite sustituir el hardware real por simuladores locales sin tocar el core
- Circuit Breaker con backoff exponencial: 1s → 2s → 4s → 8s → 16s en llamadas externas

---

## 6. REQUERIMIENTOS NO FUNCIONALES A VALIDAR

| ID | Métrica | Estrategia |
|---|---|---|
| RNF-01 | >50,000 eventos/seg en horas pico | Kafka particionado + ingesta asíncrona Go |
| RNF-02 | Disponibilidad 99.95% | Multi-AZ + bases replicadas |
| RNF-03 | Re-enrutamiento < 10 segundos | Procesamiento stream Kafka + re-enrutamiento asíncrono |
| RNF-04 | Privacidad GPS post-viaje | Privacidad diferencial (ε-DP), ruido Laplace, agregación H3 |
| C-01 | NTCIP ≤ 256 bytes UDP | Compresión binaria en `encoder.ts` |
| C-02 | Ledger inmutable | Crypto-ledger SHA-256 encadenado en PostgreSQL |
| C-03 | 10 años datos históricos S3 | Pipelines Parquet → DuckDB-Wasm |

---

## 7. DOCUMENTACIÓN REQUERIDA (ENTREGABLE)

- [ ] **Diagramas C4** — Contexto, Contenedores y Componentes
- [ ] **Diagramas de secuencia** — Flujo de re-enrutamiento crítico (<10 seg)
- [ ] **ADRs** (Architecture Decision Records) — Decisiones clave de arquitectura
- [ ] **Diagrama de despliegue en nube** — Render/Railway + SaaS Free-Tier
- [ ] **Modelo de datos del Data Lake** — Esquema analítico histórico
- [ ] **Carátula** con detalle de asistentes al hackathon

---

## 8. ORDEN DE EJECUCIÓN INMEDIATA

El siguiente es el orden en que se ejecutará el scaffold del monorepo ahora mismo:

1. **Crear estructura de directorios** completa (todos los paths del mapa de arquitectura)
2. **Generar `docker-compose.yml`** raíz con Postgres, Redis, MongoDB para desarrollo local
3. **Generar `.env.example`** unificado con todas las variables de entorno necesarias
4. **Escribir esquemas compartidos** en `shared-schemas/` (Avro GPS, JSON pagos, Proto NTCIP)
5. **Esqueleto `telemetry-ingest-ms/cmd/server/main.go`** — servidor UDP/HTTP en Go
6. **Esqueleto `unified-payment-ms/src/payments/payments.service.ts`** — transacción ACID NestJS
7. **Esqueleto `traffic-light-bridge-ms/src/ntcip/encoder.ts`** — serialización binaria NTCIP

---

## 9. TOPOLOGÍA DE TÓPICOS KAFKA

| Tópico | Productor | Consumidor | Descripción |
|---|---|---|---|
| `telemetry.raw.gps` | telemetry-ingest-ms | congestion-predictor-ms | Coordenadas GPS de buses cada 500ms |
| `traffic.congestion.predicted` | congestion-predictor-ms | routing-engine-ms, notification-ms | Alerta de congestión detectada (D > 85%) |
| `bus.reroute.command` | routing-engine-ms | traffic-light-bridge-ms, notification-ms | Comando de re-enrutamiento de bus |
| `payment.transaction` | unified-payment-ms | regulatory_audit_ledger | Registro de cobros para auditoría |

---

*Plan generado automáticamente el 02/06/2026. Referencia: INSTRUCCIONES-BASE.MD, REQUERIMIENTOS.MD, FICHA-TECNICA.MD, ESTRUCTURA.MD*
