PLAN DE ARQUITECTURA E INGENIERÍA DE SOFTWARE
Plataforma Inteligente de Movilidad Urbana (UrbanFlow Technologies Ltda.)
Este documento técnico de nivel enterprise define la arquitectura, el diseño de datos, los flujos críticos y la estrategia de despliegue para el desarrollo y validación de la plataforma de movilidad de UrbanFlow, bajo un enfoque realista, escalable y optimizado para entornos de desarrollo con recursos gratuitos (Free-Tiers).

1. Mapeo del Stack Tecnológico (Free-Tier & Serverless Scalable)
Para permitir el desarrollo ágil sin incurrir en costos iniciales de infraestructura, pero asegurando una transición directa a producción empresarial, se ha seleccionado el siguiente ecosistema:

Componente Arquitectónico

Herramienta Enterprise

Equivalente Free-Tier de Desarrollo

Límites del Plan Gratuito

Message Broker (Event Streaming)

Apache Kafka (AWS MSK)

Upstash Kafka

10,000 mensajes por día (Serverless, protocolo Kafka nativo).

Multimodal Routing (Grafo)

AWS Neptune

Neo4j AuraDB

1 Instancia de Grafo gratuita en la nube con hasta 200,000 nodos y 400,000 relaciones.

Unified Payments (Relational ACID)

AWS Aurora PostgreSQL

Supabase (Postgres gestionado)

2 proyectos activos, 500MB de base de datos, 1GB de almacenamiento de archivos.

Transit Telemetry (Time-Series)

TimescaleDB

Supabase (con extensión TimescaleDB / Tablas Particionadas por tiempo).

Incluido en el plan Supabase Free.

Shared Mobility (Doc & Cache)

MongoDB + Redis

MongoDB Atlas (M0) + Upstash Redis

MongoDB: 512MB de almacenamiento persistente. Redis: 10,000 comandos diarios en memoria.

Despliegue de Microservicios

AWS EKS (Kubernetes)

Render o Railway

Render: Servicios web individuales gratuitos con auto-suspensión automática.

Data Lake de Analítica

AWS S3 + Athena

Supabase Storage + DuckDB

1GB de almacenamiento S3-compatible + Procesamiento OLAP local/in-memory sin costo.

2. Especificación Detallada de los MVPs
MVP 1: Núcleo de Movilidad y Pagos (Ponderación: 60%)
A. Planificación de Rutas Multimodales
Algoritmo de Cálculo: Implementación de una variante del algoritmo A 
∗
  adaptada a grafos temporales dinámicos. El peso de cada arista (W) entre los nodos de transporte se calcula en tiempo real mediante la siguiente función de costo multiobjetivo:

W=α⋅T 
est
​
 +β⋅C 
mon
​
 +γ⋅E 
CO 
2
​
 
​
 
Donde:

T 
est
​
 : Tiempo estimado de viaje en minutos (afectado por el estado de congestión).

C 
mon
​
 : Costo monetario del tramo en unidades financieras.

E 
CO 
2
​
 
​
 : Emisión estimada de CO 
2
​
  en gramos por kilómetro.

α,β,γ: Factores de ponderación configurados por la preferencia del usuario (Rápida, Barata o Ecológica).

Modelo en Grafo (Neo4j Schema):

Nodos: (:User), (:TransitStation {type: "Metro"|"Bus", name: String}), (:MicroMobilityHub {provider: String}), (:Intersection {lat: Float, lon: Float}).

Relaciones: [:WALKS_TO], [:TAKES_METRO {line: String, schedule: String}], [:TAKES_BUS {route_id: String}], [:RENT_SCOOTER].

B. Rastreo en Tiempo Real (Telemetry Ingestion)
Pipeline de Ingesta: Los sensores GPS de los buses y metros transmiten un payload UDP compacto hacia un microservicio ligero escrito en Go. Este valida el payload y lo publica inmediatamente en el tópico de Upstash Kafka: telemetry.raw.gps.

Esquema de Base de Datos Temporal (TimescaleDB / PostgreSQL Particionado):

CREATE TABLE bus_telemetry (
    telemetry_id UUID DEFAULT gen_random_uuid(),
    vehicle_id VARCHAR(50) NOT NULL,
    route_id VARCHAR(50) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    speed_kmh REAL NOT NULL,
    bearing SMALLINT NOT NULL, -- Dirección en grados (0-359)
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (vehicle_id, recorded_at)
);
-- Particionamiento hipertabla (ejecutado en Supabase/Postgres)
SELECT create_hypertable('bus_telemetry', 'recorded_at', chunk_time_interval => INTERVAL '1 day');

C. Sistema de Pago Unificado
Esquema Relacional de Transacciones (Supabase):

CREATE TABLE accounts (
    account_id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    balance NUMERIC(12, 2) NOT NULL CHECK (balance >= 0.00),
    currency VARCHAR(3) DEFAULT 'USD',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    amount NUMERIC(12, 2) NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('CHARGE', 'REFUND', 'RECHARGE')),
    provider_raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Garantía ACID: Las recargas y cobros se realizan usando procedimientos almacenados transaccionales (BEGIN TRANSACTION ... COMMIT) en Postgres, asegurando que ante una interrupción de red el balance de la tarjeta del ciudadano nunca quede en un estado inconsistente.

MVP 2: Control de Tráfico e Integración de Micro-Movilidad (Ponderación: 70%)
A. Control de Semáforos Inteligentes (Puente NTCIP)
Problema Físico: Los semáforos antiguos reciben comandos binarios UDP de longitud fija inferior a 256 bytes a través de una red celular 4G privada.

Solución de Software: El microservicio Traffic Light Bridge en Node.js/TypeScript traduce el JSON del bus de eventos a un buffer binario optimizado usando el estándar NTCIP 1202.

Estructura del Mensaje Binario de Salida (<256 bytes):

// Payload NTCIP binario estructurado para priorización de paso
interface NTCIP_PriorityCommand {
  magicByte: number;      // 1 byte (0x7E para inicio de trama)
  controllerId: number;   // 2 bytes (Identificador del semáforo)
  commandType: number;    // 1 byte (0x03 = Solicitud de fase prioritaria)
  phaseToExtend: number;  // 1 byte (ID de la fase semafórica a mantener en verde)
  durationSeconds: number;// 1 byte (Segundos adicionales, max: 30s)
  checksum: number;       // 1 byte (Control de integridad CRC-8)
}

B. Gestión de Scooters y Bicicletas Compartidas
Modelo NoSQL (MongoDB Atlas - M0): Colección shared_devices.

{
  "_id": {"$oid": "603d15b22f184d001f35f29a"},
  "device_id": "scooter_lime_9921",
  "provider": "Lime",
  "type": "scooter",
  "battery_level": 88,
  "status": "available", // "available", "reserved", "in_use", "maintenance"
  "current_location": {
    "type": "Point",
    "coordinates": [-74.0060, 40.7128]
  },
  "geofence_zone_id": "zone_manhattan_04",
  "last_reported_at": "2026-06-02T22:30:15Z"
}

Manejo de Concurrencia (Bloqueos en Upstash Redis): Para evitar que dos usuarios reserven el mismo scooter simultáneamente, el flujo de reserva implementa un bloqueo distribuido utilizando comandos de Redis atómicos con expiración corta (TTL de 60 segundos):

SET resource:scooter_lime_9921 "user_id_88192" NX PX 60000

MVP 3: Predicción, Notificaciones push y Analítica (Ponderación: 80%)
A. Motor de Predicción de Congestión
Metodología de Predicción: Utiliza un modelo autorregresivo ligero entrenado offline y expuesto mediante una API serverless en Python (FastAPI alojado en Render). El modelo calcula la densidad de tráfico predicha (D 
t+30
​
 ) con 30 minutos de anticipación en un corredor vial específico:

D 
t+30
​
 =θ 
0
​
 + 
i=0
∑
n
​
 θ 
i
​
 ⋅V 
t−i
​
 +μ⋅Clima 
t
​
 
Donde V 
t
​
  representa el volumen de vehículos reportado en tiempo real por el pipeline de eventos y Clima 
t
​
  es una variable categórica normalizada.

El microservicio publica un evento traffic.congestion.predicted en Kafka si la densidad supera el umbral crítico del 85%.

B. Sistema de Notificaciones Push
Consume del tópico traffic.congestion.predicted.

Identifica mediante la base de datos de grafos a los usuarios con rutas activas que intersectan el tramo congestionado en los próximos 45 minutos.

Envía notificaciones segmentadas en tiempo real usando Server-Sent Events (SSE) o WebSockets, evitando el cobro por servicios Firebase Cloud Messaging (FCM) mediante la integración de un WebSocket Server gratuito alojado en Render.

C. Panel de Analítica Histórica (Data Lake con DuckDB)
Arquitectura de Bajo Costo (Zero-Infrastructure Data Lake):

El microservicio de auditoría extrae datos históricos del almacén temporal y los escribe en formato columnar Apache Parquet.

Los archivos Parquet se cargan directamente a carpetas públicas en un bucket de Supabase Storage (S3 compatible).

El panel de administración web del cliente ejecuta DuckDB-Wasm directamente en el navegador del usuario. El navegador del cliente descarga de forma selectiva (HTTP Range Requests) los datos del bucket S3 para realizar agregaciones complejas en tiempo real a velocidad de microsegundos sin requerir servidores OLAP costosos.

MVP 4: Trazabilidad y Auditoría Regulatoria (Ponderación: 100%)
A. Trazabilidad de Re-enrutamientos y Cambios Tarifarios
Requerimiento Fiscal: Todo cambio de ruta sugerido por el sistema inteligente y cualquier actualización tarifaria debe poseer un rastro de auditoría inmutable e incuestionable para la auditoría de entes reguladores estatales.

Implementación de Ledger de Auditoría: Para cumplir con este requisito de manera robusta sin incurrir en costos de servicios especializados (como AWS QLDB), implementamos una estrategia de Encadenamiento Criptográfico (Cripto-Ledger) sobre una tabla dedicada en PostgreSQL (Supabase):

CREATE TABLE regulatory_audit_ledger (
    sequence_id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- "REROUTING_COMMAND" o "TARIFF_CHANGE"
    payload JSONB NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Garantía de Inmutabilidad mediante Triggers de Base de Datos: Se configura un trigger a nivel de base de datos que calcula el hash SHA-256 concatenando el payload actual con el current_hash de la fila inmediatamente anterior:

Hash 
n
​
 =SHA256(Payload 
n
​
 +Hash 
n−1
​
 )
Cualquier alteración en registros anteriores rompería la cadena hashes subsiguiente, facilitando la detección inmediata de manipulaciones no autorizadas durante las auditorías trimestrales.

3. Arquitectura del Sistema: Modelo C4 (Detalle de Componentes)
El siguiente diagrama muestra el flujo detallado de datos internos y las tecnologías asociadas con sus conectores en el nivel de Contenedores de la plataforma:

                                  [ Ciudadano (App Web/Móvil) ]
                                                |
                                                | HTTPS / WebSockets
                                                v
                                      +--------------------+
                                      |   API Gateway /    |
                                      |   Reverse Proxy    |
                                      |  (Render / Nginx)  |
                                      +--------------------+
                                                |
          +-------------------------------------+-------------------------------------+
          |                                     |                                     |
          v (Rutas de Grafo)                    v (Consultas / Pagos)                 v (Telemetría de Flotas)
+-----------------------+             +-----------------------+             +-----------------------+
|   Routing Engine MS   |             |  Unified Payment MS   |             | Telemetry Ingest MS   |
|   (FastAPI / Python)  |             |     (NestJS / TS)     |             |      (Go Lang)        |
+-----------------------+             +-----------------------+             +-----------------------+
          |                                     |                                     |
          v (Neo4j Protocol)                    v (PostgreSQL)                        v (Kafka Protocol)
+-----------------------+             +-----------------------+             +-----------------------+
|  Neo4j AuraDB Cloud   |             |    Supabase Database  |             |  Upstash Kafka Cloud  |
|  (Grafo Multimodal)   |             |  (ACID DB & Ledgers)  |             |  (Event Stream Hub)   |
+-----------------------+             +-----------------------+             +-----------------------+
                                                                                      |
                                                                                      v (Consumidor)
                                                                            +-----------------------+
                                                                            | Congestion Predict MS |
                                                                            |  (FastAPI / Scikit)   |
                                                                            +-----------------------+

4. Diagrama de Secuencia de Re-enrutamiento Crítico (<10 Segundos)
Este flujo secuencial garantiza la orquestación asíncrona de priorización semafórica, alertas de usuario y re-enrutamiento de buses masivos en situaciones de congestión vial:

[IoT Sensor/Bus]        [Kafka Ingest]      [Congestion MS]      [Routing Engine]      [NTCIP Bridge]      [Citizen App]
       |                     |                     |                     |                    |                  |
       |--- 发送 GPS ------>|                     |                     |                    |                  |
       |    (Every 500ms)    |                     |                     |                    |                  |
       |                     |--- Evento Ingest ->|                     |                    |                  |
       |                     |                     |--- Evaluar Dens. -->|                    |                  |
       |                     |                     |    (Si D > 85%)     |                    |                  |
       |                     |<-- Congestion Detected -------------------|                    |                  |
       |                     |                     |                     |                    |                  |
       |                     |--- Consumir Evento Congestión ----------->|                    |                  |
       |                     |                                           |-- Recalcular ruta -|                  |
       |                     |                                           |   (Multi-modal)    |                  |
       |                     |<-- Publicar 'bus.reroute' ----------------|                    |                  |
       |                     |                                                                |                  |
       |                     |--- Consumir Reroute ------------------------------------------>|                  |
       |                     |                                                                |-- Enviar UDP --->| [Semáforo Físico]
       |                     |                                                                |   NTCIP (<256B)  |   (Luz Verde)
       |                     |                                                                |                  |
       |                     |--- Consumir Alerta Re-enrutamiento ---------------------------------------------->| Enviar Push
       |                     |                                                                |                  | (SSE / Websocket)

5. Estrategia de Calidad, Desempeño y Escalabilidad
Para asegurar un rendimiento óptimo de grado industrial sin salir del marco gratuito en etapa de pruebas, el equipo de desarrollo debe adherirse a los siguientes estándares:

Indexación Inteligente de Coordenadas:

Toda consulta geoespacial que interactúe con el microservicio de micro-movilidad debe hacer uso de un índice espacial 2D en MongoDB (db.shared_devices.createIndex({ "current_location": "2dsphere" })).

Backoff Exponencial y Resiliencia:

Las llamadas a la API de pasarelas de pago externas o microservicios interconectados deben envolverse dentro de un patrón de diseño Circuit Breaker con políticas de reintentos mediante backoff exponencial (1s, 2s, 4s, 8s, 16s).

Monitoreo del Lag de Eventos:

Durante las pruebas de estrés con herramientas como K6, se vigilará que la latencia de procesamiento de eventos en Upstash Kafka no supere el promedio de 1.5 segundos para garantizar que las notificaciones de re-enrutamiento lleguen a los conductores en tiempo de diseño.

eof
