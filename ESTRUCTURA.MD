MAPA DE ARQUITECTURA, DIRECTORIOS Y FLUJOS TÉCNICOS
Plataforma Inteligente de Movilidad Urbana (UrbanFlow Technologies)
Este documento detalla la estructura física del repositorio de software (Monorepo), describiendo la función de cada archivo y el flujo detallado de datos para garantizar una implementación ágil, escalable y reproducible usando los servicios Free-Tier seleccionados.

1. Estructura General del Monorepo
Para facilitar el desarrollo concurrente de los diferentes componentes de la plataforma, se adopta un diseño de Monorepo. Esto permite centralizar la configuración de despliegue, la infraestructura como código (IaC) y compartir esquemas comunes de eventos.

urbanflow-monorepo/
├── .github/                         # Workflows de CI/CD (GitHub Actions)
│   └── workflows/
│       ├── deploy-routing.yml
│       ├── deploy-payments.yml
│       └── deploy-telemetry.yml
├── docker-compose.yml               # Orquestación local para desarrollo offline
├── README.md                        # Documentación general de instalación
├── infrastructure/                  # Infraestructura como Código (IaC) para producción
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── shared-schemas/                  # Definiciones de eventos y contratos de datos comunes
│   ├── kafka/
│   │   ├── telemetry.raw.avsc       # Esquema Avro para coordenadas GPS de buses
│   │   ├── congestion.predicted.json# Evento de predicción de cuello de botella
│   │   └── payment.transaction.json # Evento transaccional de pagos
│   └── proto/
│       └── ntcip_commands.proto     # Definiciones de Protocol Buffers para NTCIP
└── services/                        # Directorio principal de microservicios
    ├── routing-engine-ms/           # MS de Cálculo de Rutas (Python/FastAPI)
    ├── telemetry-ingest-ms/         # MS de Ingesta Masiva GPS (Go)
    ├── unified-payment-ms/          # MS de Gestión Transaccional (Node.js/NestJS)
    ├── traffic-light-bridge-ms/     # MS de Traducción a Protocolo NTCIP (TypeScript)
    ├── shared-mobility-ms/          # MS de Reserva de Scooters/Bicicletas (Node/Express)
    ├── congestion-predictor-ms/     # MS de Predicción y ML (Python/FastAPI/Scikit)
    └── notification-ms/             # MS de Alertas en Tiempo Real (Node/WebSockets)

2. Detalle de Directorios por Microservicio
A. telemetry-ingest-ms/ (Go)
Diseñado para procesar ráfagas masivas de eventos GPS de buses y metros enviándolos directamente a Upstash Kafka.

services/telemetry-ingest-ms/
├── cmd/
│   └── server/
│       └── main.go                  # Punto de entrada de la app (Inicia el servidor UDP/HTTP)
├── internal/
│   ├── config/
│   │   └── config.go                # Lee variables de entorno (Upstash Kafka credentials)
│   ├── ingest/
│   │   ├── handler.go               # Escucha payloads GPS, valida campos y estructura
│   │   └── handler_test.go          # Pruebas unitarias de validación de coordenadas
│   └── kafka/
│       └── producer.go              # Cliente optimizado de Kafka para escrituras asíncronas
├── go.mod                           # Dependencias de Go
└── Dockerfile                       # Construcción de la imagen Docker ligera

main.go: Inicializa un listener UDP en el puerto 8080 para telemetría directa de hardware legacy y un servidor HTTP para telemetría moderna.

producer.go: Utiliza confluent-kafka-go o segmentio/kafka-go para encolar eventos de telemetría sin bloquear la respuesta del servidor.

B. routing-engine-ms/ (Python/FastAPI)
Consulta la topología multimodal de la ciudad cargada en Neo4j AuraDB para calcular el trayecto idóneo.

services/routing-engine-ms/
├── app/
│   ├── __init__.py
│   ├── main.py                      # Inicializa FastAPI
│   ├── config.py                    # Configuración de conexión a Neo4j AuraDB
│   ├── api/
│   │   └── routes.py                # Endpoint: POST /v1/routes/calculate
│   ├── core/
│   │   └── algorithms.py            # Variación de A* sobre grafos de Neo4j
│   └── database/
│       └── neo4j_connection.py      # Driver de conexión y pooling para AuraDB
├── requirements.txt                 # Dependencias (fastapi, neo4j, uvicorn)
└── Dockerfile

algorithms.py: Contiene la lógica matemática para evaluar costo monetario (C 
mon
​
 ), tiempo estimado (T 
est
​
 ) y huella de carbono (E 
CO 
2
​
 
​
 ) traduciendo la petición del usuario en una consulta Cypher ejecutada en Neo4j.

routes.py: Recibe las coordenadas de inicio y fin, solicita el cálculo al grafo y retorna las alternativas de viaje ordenadas por prioridad.

C. unified-payment-ms/ (Node.js/NestJS)
Gestiona cuentas de usuario, saldos y el procesamiento estricto de cobros unificados de pasajes en Supabase (PostgreSQL).

services/unified-payment-ms/
├── src/
│   ├── app.module.ts                # Módulo raíz de la aplicación NestJS
│   ├── main.ts                      # Punto de entrada principal
│   ├── config/
│   │   └── database.config.ts       # Configuración del ORM para Supabase Postgres
│   ├── accounts/
│   │   ├── accounts.controller.ts   # Endpoints: GET /accounts/balance, POST /accounts/recharge
│   │   ├── accounts.service.ts      # Lógica de negocio (Consultas y validación de saldos)
│   │   └── entities/
│   │       └── account.entity.ts    # Mapeo relacional de la cuenta del usuario
│   └── payments/
│       ├── payments.controller.ts   # Endpoint: POST /payments/charge
│       ├── payments.service.ts      # Lógica transaccional (ACID) de cobro multimodal
│       └── entities/
│           └── transaction.entity.ts# Registro histórico de transacciones
├── package.json
└── Dockerfile

payments.service.ts: Implementa transacciones de base de datos (EntityManager.transaction()) para asegurar el principio de todo o nada (Atomicity) al descontar dinero de la cuenta del usuario y registrar la transacción.

D. traffic-light-bridge-ms/ (Node.js/TypeScript)
Escucha comandos de re-enrutamiento de Kafka y emite instrucciones de prioridad de paso UDP a los semáforos en formato NTCIP binario.

services/traffic-light-bridge-ms/
├── src/
│   ├── index.ts                     # Punto de entrada (Inicia consumidor de Kafka)
│   ├── config.ts                    # Credenciales de Upstash Kafka y mapas IP de semáforos
│   ├── kafka/
│   │   └── consumer.ts              # Escucha el tópico 'bus.reroute.command'
│   └── ntcip/
│       ├── encoder.ts               # Traduce payloads JSON a bytes NTCIP
│       └── udp_client.ts            # Abre socket UDP y transmite al controlador físico
├── package.json
└── Dockerfile

encoder.ts: Empaqueta el ID del semáforo, la fase a alterar y el tiempo de extensión dentro de un Buffer binario estricto de menos de 256 bytes para no saturar la red 4G celular de la vía pública.

E. congestion-predictor-ms/ (Python/FastAPI + Scikit-Learn)
Analiza el flujo de eventos, predice congestión en un horizonte de 30 minutos y alerta para re-enrutamiento preventivo.

services/congestion-predictor-ms/
├── app/
│   ├── main.py                      # API de diagnóstico de congestión vial
│   ├── model/
│   │   ├── predictor.py             # Carga el modelo autorregresivo persistido (.pkl)
│   │   └── train.py                 # Script offline para re-entrenar el modelo con datos del Data Lake
│   └── kafka/
│       └── stream_listener.py       # Consume micro-lotes de 'telemetry.raw.gps' para inferencia
├── requirements.txt                 # Pandas, scikit-learn, joblib, kafka-python
└── Dockerfile

stream_listener.py: Lee los eventos continuos de velocidad de los buses y estima la velocidad promedio del corredor. Si el modelo matemático en predictor.py detecta alta probabilidad de bloqueo, gatilla un evento de congestión en Kafka.

3. Mapeo de Flujos de Negocio a Archivos Físicos
A continuación se muestra el mapeo de los flujos de datos a los componentes de software descritos anteriormente:

                                      FLUJO 1: RE-ENRUTAMIENTO AUTOMÁTICO < 10 SEG.
                                      
  [IoT Sensor / Bus] -> (GPS UDP) -> [telemetry-ingest-ms/cmd/server/main.go]
                                                  |
                                                  v (Publica en Kafka: 'telemetry.raw.gps')
                                     [congestion-predictor-ms/app/kafka/stream_listener.py]
                                                  |
                                                  v (Detecta congestión vial / Publica en Kafka)
                                     [routing-engine-ms/app/api/routes.py] (Recalcula ruta de buses)
                                                  |
                                                  v (Emite comando en Kafka: 'bus.reroute.command')
                                     [traffic-light-bridge-ms/src/kafka/consumer.ts]
                                                  |
                                                  v (Compila bytes en NTCIP y transmite vía UDP)
                                    [Legacy Traffic Light Hardware (Semáforo Físico)]

                                      FLUJO 2: RESERVA CONCURRENTE DE SCOOTERS
                                      
             [Ciudadano (App)] -> (POST /scooters/reserve) -> [shared-mobility-ms]
                                                                    |
                                                                    v
                                               [Upstash Redis (Lock Distribuido NX PX)]
                                            (Valida que nadie más tenga bloqueado el ID)
                                                                    |
                                                                    v (Si es exitoso, actualiza)
                                                      [MongoDB Atlas (Colección)]

                                      FLUJO 3: COBRO MULTIMODAL UNIFICADO
                                      
           [Lector de Tarjeta/QR] -> (POST /payments/charge) -> [unified-payment-ms]
                                                                    |
                                                                    v
                                              [payments.service.ts (Transacción ACID)]
                                         (Verifica balance, descuenta saldo y registra evento)
                                                                    |
                                                                    v
                                                        [Supabase PostgreSQL]

4. Estrategia de Configuración para Entornos Locales y de Desarrollo (Free-Tier)
Para que el equipo de desarrollo pueda poner en marcha todo el sistema de manera unificada y sin costos, el archivo docker-compose.yml en la raíz del monorepo está diseñado para emular la infraestructura, o bien conectar los microservicios locales a las APIs en la nube de nivel gratuito:

Bases de Datos Persistentes: Los microservicios de desarrollo apuntan directamente a las cadenas de conexión provistas por MongoDB Atlas (M0), Supabase y Neo4j AuraDB mediante variables de entorno configuradas en archivos .env individuales dentro de cada subcarpeta de servicio.

Event Broker: El microservicio de ingesta de Go y el predictor en Python consumen y producen eventos apuntando al puerto SSL seguro provisto de forma gratuita por Upstash Kafka, el cual funciona sobre protocolos web seguros sin necesidad de abrir túneles VPC de alta complejidad técnica durante la fase de evaluación.

eof
