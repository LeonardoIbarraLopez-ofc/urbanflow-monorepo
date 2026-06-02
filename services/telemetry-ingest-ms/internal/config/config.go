// config.go — Carga de variables de entorno para telemetry-ingest-ms.
// Lee credenciales de Upstash Kafka y puertos de los servidores UDP/HTTP.

package config

import (
	"log"
	"os"
)

// Config contiene toda la configuración necesaria para el microservicio de ingesta.
type Config struct {
	// Puertos de los servidores
	HTTPPort string
	UDPPort  string

	// Credenciales de Upstash Kafka
	KafkaBrokers  string
	KafkaUsername string
	KafkaPassword string

	// Tópico destino de los eventos GPS
	KafkaTopicGPS string
}

// Load lee las variables de entorno y retorna la configuración.
// Si falta alguna variable crítica, termina el proceso con error fatal.
func Load() *Config {
	cfg := &Config{
		HTTPPort:      getEnv("TELEMETRY_HTTP_PORT", "8080"),
		UDPPort:       getEnv("TELEMETRY_UDP_PORT", "9001"),
		KafkaBrokers:  requireEnv("UPSTASH_KAFKA_BROKERS"),
		KafkaUsername: requireEnv("UPSTASH_KAFKA_USERNAME"),
		KafkaPassword: requireEnv("UPSTASH_KAFKA_PASSWORD"),
		KafkaTopicGPS: getEnv("KAFKA_TOPIC_GPS", "telemetry.raw.gps"),
	}
	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func requireEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("Variable de entorno requerida no definida: %s", key)
	}
	return v
}
