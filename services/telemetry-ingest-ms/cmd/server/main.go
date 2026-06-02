// main.go — Punto de entrada del microservicio de ingesta de telemetría GPS (Dev 1).
// Inicia dos servidores en paralelo:
//   - UDP en puerto 9001: recibe payloads binarios compactos de buses legacy
//   - HTTP en puerto 8080: recibe telemetría JSON de buses con hardware moderno
// Ambos publican eventos en Upstash Kafka topic 'telemetry.raw.gps'.

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/urbanflow/telemetry-ingest-ms/internal/config"
	"github.com/urbanflow/telemetry-ingest-ms/internal/ingest"
	"github.com/urbanflow/telemetry-ingest-ms/internal/kafka"
)

func main() {
	// Cargar configuración desde variables de entorno
	cfg := config.Load()

	// Inicializar productor Kafka asíncrono hacia Upstash
	producer, err := kafka.NewProducer(cfg)
	if err != nil {
		log.Fatalf("Error inicializando productor Kafka: %v", err)
	}
	defer producer.Close()

	handler := ingest.NewHandler(producer)

	// Servidor HTTP para telemetría JSON (buses con Android a bordo)
	httpServer := &http.Server{
		Addr:         ":" + cfg.HTTPPort,
		Handler:      handler.HTTPMux(),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	// Iniciar servidor UDP en goroutine para telemetría legacy
	go func() {
		log.Printf("UDP listener escuchando en :%s", cfg.UDPPort)
		if err := handler.ListenUDP(cfg.UDPPort); err != nil {
			log.Fatalf("Error en servidor UDP: %v", err)
		}
	}()

	// Iniciar servidor HTTP en goroutine
	go func() {
		log.Printf("HTTP server escuchando en :%s", cfg.HTTPPort)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error en servidor HTTP: %v", err)
		}
	}()

	// Graceful shutdown al recibir SIGINT o SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Apagando servidores...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		log.Printf("Error en shutdown HTTP: %v", err)
	}
	log.Println("Microservicio detenido correctamente")
}
