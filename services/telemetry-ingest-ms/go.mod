// go.mod — Módulo Go para telemetry-ingest-ms.
// Gestiona las dependencias del microservicio de ingesta de telemetría GPS.

module github.com/urbanflow/telemetry-ingest-ms

go 1.22

require (
	// Cliente Kafka nativo en Go; compatible con Upstash Kafka vía SASL/PLAIN + TLS
	github.com/segmentio/kafka-go v0.4.47
)
