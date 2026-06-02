[ROL DE EJECUCIÓN]
Actúa como un Staff Engineer, Arquitecto de Software Principal y Líder de Calidad Técnico. Tu tarea es inicializar, coordinar y escribir el andamiaje (scaffolding) de código inicial para el proyecto "UrbanFlow", basándote estrictamente en los documentos adjuntos en el espacio de trabajo:
1. `requirements_validation_guide.md` (Requerimientos, restricciones NTCIP, privacidad y auditoría)
2. `urbanflow_architecture_spec.md` (Selección de persistencia políglota, AWS, Upstash, Supabase)
3. `urbanflow_directory_map.md` (Estructura física del Monorepo)

---

### PARTE 1: PLAN DE ASIGNACIÓN Y TRABAJO PARA 5 DESARROLLADORES (5 DEVS)

Para maximizar el paralelismo, evitar bloqueos de dependencias cruzadas y entregar los 4 MVPs en tiempo récord, estructuraremos al equipo bajo un esquema de "Desarrollo Basado en Contratos e Interfaces (API-First)". Asigna los roles y tareas de la siguiente manera:

#### Developer 1: Lead Platform, Ingest & DevOps (Especialista en Go y Streaming)
*   **Responsabilidades:** Configuración del Monorepo, pipelines locales de Docker Compose, ingesta de telemetría e infraestructura de Eventos.
*   **Tareas Críticas:**
    1. Implementar el andamiaje del Monorepo y el `docker-compose.yml` para emulación local.
    2. Desarrollar `services/telemetry-ingest-ms` en Go para recibir coordenadas GPS e inyectarlas a Upstash Kafka de manera asíncrona.
    3. Diseñar los esquemas JSON Schema/Avro comunes en `shared-schemas/`.

#### Developer 2: Core Transactions, Ledger & Payments (Especialista en NestJS y DBs Relacionales)
*   **Responsabilidades:** Consistencia transaccional de pagos, cuentas de usuario, y cumplimiento del ledger inmutable para auditoría de la alcaldía (MVP 4).
*   **Tareas Críticas:**
    1. Implementar `services/unified-payment-ms` usando NestJS/TypeScript.
    2. Configurar el esquema de base de datos relacional y transacciones ACID en Supabase (Postgres).
    3. Escribir el disparador (Trigger) o lógica de cifrado para el ledger criptográfico encadenado de auditoría (`regulatory_audit_ledger`).

#### Developer 3: Routing Engine & Shared Mobility (Especialista en Algoritmia, Python/FastAPI y Grafos)
*   **Responsabilidades:** Algoritmo dinámico multimodal, reservas concurrentes en caché y telemetría de micro-movilidad.
*   **Tareas Críticas:**
    1. Desarrollar `services/routing-engine-ms` en FastAPI/Python implementando la conexión a Neo4j AuraDB.
    2. Diseñar la lógica del algoritmo de cálculo de costos ponderados combinando distancia, precio y huella de $CO_2$.
    3. Programar en `shared-mobility-ms` el sistema de reservas distribuidas utilizando bloqueos atómicos en Upstash Redis (`SET NX PX`).

#### Developer 4: Data Science, ML & Analytics (Especialista en Python, Spark/DuckDB y Data Lakes)
*   **Responsabilidades:** Predicción de congestión a 30 minutos y generación de KPIs para el panel de la alcaldía.
*   **Tareas Críticas:**
    1. Implementar `services/congestion-predictor-ms` consumiendo micro-lotes del stream de Kafka `telemetry.raw.gps`.
    2. Entrenar/mockear el regresor lineal/modelo autorregresivo para predecir saturación de corredores.
    3. Configurar la exportación de logs limpios en formato Apache Parquet hacia Supabase Storage y diseñar las consultas DuckDB-Wasm para el panel web.

#### Developer 5: Bridge, Notifications & Integration (Especialista en Node/TS, IoT y WebSockets)
*   **Responsabilidades:** El puente físico de semáforos inteligentes bajo especificación NTCIP y notificaciones push geolocalizadas.
*   **Tareas Críticas:**
    1. Programar `services/traffic-light-bridge-ms` en TypeScript para traducir comandos de re-enrutamiento de Kafka a tramas binarias UDP NTCIP (<256 bytes).
    2. Implementar `services/notification-ms` con WebSockets/SSE para despachar alertas de desvío personalizadas en tiempo real.
    3. Construir una interfaz mínima en React (Dashboard) que interactúe con los SSE y muestre el flujo del simulador.

---

### PARTE 2: PRÁCTICAS DE INGENIERÍA PARA EL FLUJO PERFECTO (CERO BLOQUEOS)

Para garantizar que los 5 desarrolladores trabajen en armonía, implementa y haz cumplir las siguientes directrices técnicas:

1.  **API-First y Mocks en el Día 1:**
    *   Ningún desarrollador puede esperar a que el microservicio del otro esté terminado. Se deben definir de inmediato los contratos de API usando Swagger (OpenAPI) o AsyncAPI para Kafka.
    *   Cada desarrollador debe implementar un middleware/controlador de "Mock" que retorne datos estáticos de prueba que respeten el formato del contrato para que el resto pueda consumir desde el primer minuto.
2.  **Estrategia de Branching (Git Trunk-Based Development de Hackatón):**
    *   No usar GitFlow complejo. Usar desarrollo basado en el tronco principal (`main`).
    *   Cada funcionalidad se trabaja en una rama corta `feature/dev[1-5]-funcionalidad`.
    *   Los Pull Requests (PR) deben ser auto-contenidos, requerir al menos 1 aprobación cruzada de código y pasar el linter y tests automatizados antes de fusionarse.
3.  **Configuración de Entorno Unificada con Docker Compose:**
    *   El archivo de orquestación local debe levantar contenedores simulados de las bases de datos para desarrollo offline, pero permitiendo mediante banderas (`ENV`) cambiar los endpoints a los SaaS en la nube (*Supabase, Upstash, MongoDB Atlas*).
4.  **Inyección de Dependencias y Desacoplamiento:**
    *   Asegurar que todas las llamadas externas de red (como APIs financieras o llamadas de IoT de semáforos) estén aisladas detrás de interfaces y patrones *Factory* o *Adapter*. Esto permite cambiar el hardware real por simuladores locales sin romper el core del negocio.

---

### PARTE 3: INSTRUCCIONES DE EJECUCIÓN INMEDIATA PARA CLAUDE CLI

Claude CLI, ejecuta secuencialmente los siguientes pasos para dar inicio al proyecto:

1.  **Creación de Estructura de Directorios:** Genera de forma recursiva toda la jerarquía de carpetas definida en el archivo `urbanflow_directory_map.md`.
2.  **Generación de Archivos de Configuración Global:** 
    *   Genera el `docker-compose.yml` en la raíz, incluyendo imágenes para pruebas locales de Postgres, Redis y MongoDB.
    *   Genera un archivo `.env.example` unificado en la raíz.
3.  **Definición de Contratos Compartidos (`shared-schemas/`):** 
    *   Escribe el JSON de esquema para la telemetría GPS y el JSON para transacciones de pago.
4.  **Generación de Esqueletos Base de Microservicios:**
    *   Crea el archivo `services/telemetry-ingest-ms/cmd/server/main.go` con un servidor HTTP y UDP básico de ingesta en Go.
    *   Crea el archivo `services/unified-payment-ms/src/payments/payments.service.ts` con el esqueleto de la transacción ACID para Supabase PostgreSQL.
    *   Crea el archivo de utilidades binarias `services/traffic-light-bridge-ms/src/ntcip/encoder.ts` en TypeScript para la serialización binaria NTCIP de 256 bytes.

Comienza generando la estructura de directorios y el docker-compose global para arrancar el entorno de desarrollo ahora mismo.