GUÍA DE VALIDACIÓN DE REQUERIMIENTOS Y CONFORMIDAD TÉCNICA
Plataforma Inteligente de Movilidad Urbana — UrbanFlow Technologies
Este documento funciona como una matriz de trazabilidad y guía de aceptación para verificar el cumplimiento del 100% de los requerimientos y restricciones establecidos para la Tercera Evaluación Semestral (Quinta Hackatón). Se estructuran los criterios de aceptación técnicos y funcionales que deben validarse para cada MVP de la arquitectura.

1. Ficha del Proyecto y Perfiles de Usuario
1.1 Metas de Alto Nivel
Población objetivo: Metrópolis de >5,000,000 de habitantes.

Meta ambiental: Reducción del 30% en las emisiones de CO 
2
​
  de la ciudad en un plazo de tres (3) años.

Objetivo técnico: Plataforma inteligente de movilidad multimodal de alta disponibilidad con procesamiento de eventos en tiempo real.

1.2 Matriz de Actores y Usuarios a Validar
ID

Actor

Descripción / Carga Operativa

Método de Validación de Acceso

U-01

Ciudadanos

>3.2 millones de usuarios activos de transporte.

App Móvil, Web, Tarjeta NFC, Códigos QR.

U-02

Conductores de Bus

~4,500 operadores del sistema de transporte masivo.

Terminal de Telemetría a Bordo (Android/Tablet).

U-03

Operadores del Centro de Control

~200 operadores en turnos continuos 24/7.

Dashboard Web de Control de Tráfico.

U-04

Proveedores de Movilidad

Terceros (Scooters, bicicletas, carpooling).

Integración vía API / Webhooks del Hub de Micro-movilidad.

U-05

Autoridades y Analistas

Planificadores urbanos de la Alcaldía.

Panel OLAP de Analítica Histórica (DuckDB/S3).

U-06

Entidades Financieras

Procesadores de pago y pasarelas bancarias.

Interfaz de Compensación / API de Liquidación.

2. Matriz Exhaustiva de Requerimientos Funcionales (RF)
ID

Requerimiento Funcional

Criterio de Aceptación Técnico

Componente de Arquitectura Asociado

Estado

RF-01

Planificación Multimodal en Tiempo Real

El motor debe calcular rutas óptimas combinando: Bus + Metro + Scooter + Caminata. Debe estimar con precisión el tiempo total, costo financiero acumulado y huella de carbono de cada tramo antes de confirmar el trayecto.

routing-engine-ms (Neo4j / Algoritmo A 
∗
 )

[ ]

RF-02

Rastreo y Arribos Exactos (GPS)

Integrar la posición de GPS exacta de la flota completa de buses y metros. No se permiten estimaciones estáticas; se deben proyectar tiempos de llegada basados en la telemetría viva del vehículo respecto a la parada.

telemetry-ingest-ms (Go, TimescaleDB, Kafka)

[ ]

RF-03

Pago Unificado Multimodal

Descontar automáticamente la tarifa del viaje del saldo del usuario mediante tres modalidades: Tarjeta física NFC, App móvil y códigos QR dinámicos. Debe aplicar los descuentos o subsidios vigentes por combinación de modos de forma consistente.

unified-payment-ms (PostgreSQL Transaccional ACID)

[ ]

RF-04

Priorización Semafórica Inteligente

El sistema debe emitir automáticamente instrucciones a los semáforos viales prioritarios cuando se detecte un bus con retraso >5 minutos o un vehículo de emergencia activo.

traffic-light-bridge-ms (Protocolo UDP NTCIP)

[ ]

RF-05

Gestión de Micro-movilidad

Administrar en tiempo real la disponibilidad, reserva segura, comando de desbloqueo remoto y recepción de reportes de daños físicos de scooters y bicicletas eléctricas compartidas.

shared-mobility-ms (MongoDB Atlas / Upstash Redis)

[ ]

RF-06

Predicción y Re-enrutamiento

Predecir con 30 minutos de anticipación cuellos de botella y puntos de congestión severa. Ejecutar el re-enrutamiento automático de los buses asignados al corredor afectado y notificar en sus terminales a los conductores.

congestion-predictor-ms (Modelos de ML + Kafka)

[ ]

RF-07

Notificaciones Push Activas

El ciudadano debe recibir alertas push dinámicas y personalizadas en su dispositivo móvil sobre interrupciones, retrasos imprevistos o sugerencias de desvío únicamente durante el transcurso de su viaje activo.

notification-ms (WebSockets / SSE)

[ ]

RF-08

Panel de Analítica (KPIs Alcaldía)

Mostrar métricas en tiempo real de: flujo vehicular por corredor vial, índice de puntualidad de la flota, volumen acumulado de emisiones de CO 
2
​
  evitadas y ocupación promedio de las unidades.

Panel Frontend + DuckDB-Wasm (AWS S3)

[ ]

3. Matriz de Requerimientos No Funcionales (RNF) y Restricciones
ID

Requerimiento No Funcional / Restricción

Umbral Métrico / Restricción Física

Estrategia de Mitigación / Validación Técnica

Estado

RNF-01

Rendimiento bajo Hora Pico

Procesar un flujo de >50,000 eventos por segundo durante las ventanas de horas pico críticas (07:00-09:00 y 17:00-19:00).

Ingesta asíncrona desacoplada con clúster particionado en Kafka (Upstash Kafka / AWS MSK).

[ ]

RNF-02

Disponibilidad Crítica

SLA mínimo de 99.95%. Una interrupción en hora pico causaría el colapso vial de la metrópolis.

Despliegue Multi-AZ en Kubernetes (Amazon EKS / Render Pro) con bases de datos replicadas y balanceadores de carga redundantes.

[ ]

RNF-03

Latencia de Re-enrutamiento

El cálculo y transmisión de un cambio de ruta de bus afectado debe ejecutarse en menos de 10 segundos tras la detección del incidente.

Procesamiento de flujo en tiempo real (Flink/Kafka streams) y re-enrutamiento asíncrono asilado.

[ ]

RNF-04

Privacidad del Ciudadano

Las coordenadas GPS exactas se restringen al viaje activo. Al concluir el trayecto, los datos deben anonimizarse irreversiblemente.

Implementación de Privacidad Diferencial (ϵ-DP). Inyección de ruido de Laplace y agregación a celdas de rejilla espacial (H3).

[ ]

C-01

Compatibilidad Semafórica (NTCIP)

Hardware legacy con 20 años de antigüedad. Comunicación sobre red privada 4G celular mediante protocolo NTCIP con mensajes binarios de máximo 256 bytes.

Compresión binaria en traffic-light-bridge-ms traduciendo payloads JSON a tramas crudas UDP de baja densidad.

[ ]

C-02

Trazabilidad y Auditoría Estatal

El ente regulador exige trazabilidad cronológica completa y no modificable de re-enrutamientos y alteraciones tarifarias para revisiones trimestrales.

Estructuración de un Cripto-Ledger mediante tablas de base de datos encadenadas criptográficamente con hashes SHA-256 (regulatory_audit_ledger).

[ ]

C-03

Aprovechamiento de Históricos

Carga y consumo de 10 años de datos históricos de tráfico preexistentes almacenados en el Data Lake de la alcaldía (AWS S3).

Pipelines de entrenamiento para los modelos de ML del predictor consumiendo archivos Parquet directamente de buckets S3.

[ ]

4. Guía de Criterios de Aceptación por MVP (Plan de Evaluación)
MVP 1: Núcleo de Movilidad y Pagos (Peso: 60%)
[ ] Validación 1.1: Ingresar un origen y destino multimodal en el planificador y verificar que la respuesta contenga tramos combinados (metro + scooter + caminata) junto al cálculo dinámico del costo (C 
mon
​
 ) y la estimación de emisiones de carbono (E 
CO 
2
​
 
​
 ).

[ ] Validación 1.2: Inyectar una coordenada GPS simulada en el microservicio de telemetría y constatar en milisegundos la actualización del tiempo de arribo exacto en el cliente sin recargar la pantalla.

[ ] Validación 1.3: Simular un cobro con saldo insuficiente y verificar que la base de datos de transacciones (PostgreSQL) rechace la operación y mantenga la cuenta con su saldo original sin inconsistencias (Rollback transaccional).

MVP 2: Tránsito Vial y Micro-movilidad (Peso: 70%)
[ ] Validación 2.1: Emitir una petición de prioridad para una unidad retrasada y auditar mediante un sniffer de red que el paquete emitido por el bridge NTCIP sea binario, viaje por UDP y pese menos de 256 bytes.

[ ] Validación 2.2: Realizar dos peticiones de reserva simultáneas sobre el mismo identificador de scooter y verificar que el bloqueo distribuido en Redis asigne exitosamente la unidad al primer usuario y deniegue limpiamente la transacción al segundo.

MVP 3: Inteligencia Predictiva y Alertas (Peso: 80%)
[ ] Validación 3.1: Elevar artificialmente el volumen de eventos de tráfico simulados en un corredor vial y certificar que el predictor detecte la anomalía con 30 minutos de antelación y gatille el evento de re-enrutamiento.

[ ] Validación 3.2: Verificar que los ciudadanos que se encuentren simulando un viaje sobre el corredor congestionado reciban de inmediato una notificación push WebSocket con el trayecto alternativo propuesto.

[ ] Validación 3.3: Ejecutar una consulta analítica compleja sobre el volumen de datos históricos en el Data Lake y verificar que DuckDB la resuelva en el navegador cliente en menos de 2 segundos mediante peticiones Parquet selectivas.

MVP 4: Cumplimiento Regulatorio e Inmutabilidad (Peso: 100%)
[ ] Validación 4.1: Registrar un cambio de tarifa y un evento de desvío de buses.

[ ] Validación 4.2: Intentar modificar maliciosamente una fila histórica en la tabla de auditoría (regulatory_audit_ledger) y comprobar que el sistema de validación detecte de forma inmediata la ruptura de la cadena criptográfica (hashes alterados).

eof
