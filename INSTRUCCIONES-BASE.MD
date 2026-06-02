KATA ARQUITECTÓNICO – QUINTA HACKATON (02/06/2026) 
TERCERA EVALUACIÓN SEMESTRAL

START UP URBANFLOW TECHNOLOGIES LTDA.
La alcaldía de una metrópolis de más de 5 millones de habitantes está perdiendo miles de millones anuales en congestión vial y contaminación. Tras un proceso de innovación abierta, contratan a UrbanFlow Technologies Ltda. para construir una Plataforma Inteligente de Movilidad Urbana que integre en tiempo real buses, metro, ciclovías, scooters eléctricos compartidos, carpooling y semáforos inteligentes, permitiendo a los ciudadanos planificar rutas óptimas multimodales y reduciendo las emisiones de CO₂ de la ciudad en un 30% en tres años.
Usuarios
Más de 3.2 millones de ciudadanos usuarios de transporte público y privado.
~4.500 conductores de buses del sistema de transporte masivo.
Operadores del Centro de Control de Tráfico (~200 operadores en turnos 24/7).
Proveedores externos de movilidad compartida (scooters, bicicletas, carpooling).
Autoridades municipales y analistas de planificación urbana.
Entidades financieras para el sistema de pago unificado.
Requerimientos
Funcionales
Los ciudadanos deben poder planificar rutas multimodales en tiempo real (bus + metro + scooter + caminata) con estimación de tiempo, costo y huella de carbono de cada opción.
El sistema debe integrar en tiempo real la posición GPS de todos los buses y metros de la ciudad para mostrar llegadas exactas (no estimadas) a cada parada.
Debe existir un sistema de pago unificado con tarjeta física NFC, app móvil y QR, que descuente automáticamente el costo según la combinación de modos usada en un viaje.
Los semáforos inteligentes deben recibir instrucciones del sistema para dar prioridad a buses con retraso mayor a 5 minutos o vehículos de emergencia detectados.
El sistema de scooters y bicicletas compartidas debe gestionar disponibilidad, reservas, desbloqueo remoto y reportes de daños en tiempo real.
La plataforma debe predecir con 30 minutos de anticipación los puntos de congestión y re-enrutar buses automáticamente notificando a conductores.
Los ciudadanos deben recibir notificaciones push personalizadas sobre interrupciones, desvíos o alternativas durante su viaje activo.
El panel de analítica de la alcaldía debe mostrar KPIs de movilidad en tiempo real: flujo por corredor, índice de puntualidad, emisiones evitadas, y ocupación promedio.
No Funcionales
El sistema debe procesar más de 50,000 eventos por segundo durante horas pico (7-9 AM y 5-7 PM).
Disponibilidad 99.95%; una falla del sistema durante hora pico colapsa la ciudad.
El tiempo de re-enrutamiento de un bus debe ejecutarse en menos de 10 segundos desde la detección de la anomalía.
Los datos de ubicación de usuarios solo pueden usarse durante el viaje activo; deben anonimizarse al finalizar (privacidad diferencial).
Contexto Adicional
El sistema de semáforos existente tiene 20 años y se comunica por protocolo NTCIP sobre red 4G privada; la integración debe ser bidireccional, pero con mensajes de máximo 256 bytes.
Los datos del sistema son auditados trimestralmente por el ente regulador de transporte nacional, que exige trazabilidad completa de todos los eventos de re-enrutamiento y cambios de tarifa.
La alcaldía ya tiene contratado un data lake en la nube (AWS S3) con datos históricos de 10 años de movilidad que deben usarse para los modelos de predicción de congestión.

Instrucciones
Desarrollar el sistema que la alcaldía está solicitando considerando los siguientes puntos:

N°	MVP	Ponderación
1	Incisos I., II., III. – Planificación de rutas multimodales, rastreo en tiempo real y pago unificado.	60%
2	Incisos IV., V. – Control de semáforos inteligentes y gestión de scooters/bicicletas compartidas.	70%
3	Incisos VI., VII., VIII. – Predicción de congestión, notificaciones push y panel de analítica.	80%
4	Inciso b) del Contexto Adicional – Trazabilidad de re-enrutamientos y cambios de tarifa para auditoría regulatoria.	100%

Importante por considerar: los MVPs no pueden ser básicos; deben tener una complejidad media. La arquitectura obligatoria es microservicios con event streaming (Kafka o similar) para el procesamiento de eventos en tiempo real.
Cada microservicio debe tener su propia base de datos (polyglot persistence: time-series para telemetría, relacional para pagos, grafo para rutas). Incluir enlaces a repositorios de Github del grupo.
Rúbrica
Los MVPs se desarrollan en el tiempo de clase de 18:30 a 20:45.
De ser necesario habrá un sprint retrospective el 11/06/2026 para consultas.
Documentación requerida: diagramas C4, diagramas de secuencia para el flujo de re-enrutamiento, ADRs y diagrama de despliegue en nube.
Debe diseñarse el modelo de datos para el data lake de analítica histórica.
El documento entregable debe incluir carátula con detalle de asistentes al hackathon.
