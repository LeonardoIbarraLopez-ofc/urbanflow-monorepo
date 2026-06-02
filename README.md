# UrbanFlow — Plataforma Inteligente de Movilidad Urbana

Monorepo de microservicios para la plataforma de movilidad urbana multimodal de UrbanFlow Technologies Ltda.
Integra buses, metro, micro-movilidad, semáforos inteligentes y pagos unificados en tiempo real.

## Arquitectura

- **Event Streaming:** Upstash Kafka
- **Grafo multimodal:** Neo4j AuraDB
- **Pagos / Telemetría:** Supabase (PostgreSQL + TimescaleDB)
- **Micro-movilidad:** MongoDB Atlas + Upstash Redis
- **Despliegue:** Render / Railway (Free-Tier)
- **Data Lake:** Supabase Storage + DuckDB-Wasm

## Microservicios

| Servicio | Lenguaje | Puerto | Responsabilidad |
|---|---|---|---|
| `telemetry-ingest-ms` | Go | 8080/UDP:9001 | Ingesta GPS de buses → Kafka |
| `routing-engine-ms` | Python/FastAPI | 8000 | Cálculo de rutas A* multimodal |
| `unified-payment-ms` | NestJS/TypeScript | 3000 | Pagos ACID NFC/QR/App |
| `traffic-light-bridge-ms` | TypeScript | 3000 | Kafka → NTCIP UDP binario |
| `shared-mobility-ms` | Node/Express | 3000 | Reservas scooters/bicicletas |
| `congestion-predictor-ms` | Python/FastAPI | 8001 | ML predicción congestión 30min |
| `notification-ms` | Node/WebSockets | 3000 | Alertas push SSE en tiempo real |

## Inicio rápido (desarrollo local)

```bash
cp .env.example .env
# Editar .env con credenciales reales
docker-compose up -d postgres redis mongodb
```

## MVPs

- **MVP 1 (60%):** Rutas multimodales + rastreo GPS + pago unificado
- **MVP 2 (70%):** Semáforos NTCIP + gestión micro-movilidad
- **MVP 3 (80%):** Predicción congestión + notificaciones + analítica
- **MVP 4 (100%):** Ledger criptográfico de auditoría regulatoria
