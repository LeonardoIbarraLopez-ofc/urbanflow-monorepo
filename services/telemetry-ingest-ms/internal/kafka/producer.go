// producer.go — Cliente Kafka asíncrono para publicar eventos GPS en Upstash Kafka.
// Utiliza segmentio/kafka-go con conexión TLS requerida por Upstash.
// La publicación es no-bloqueante: el handler HTTP responde inmediatamente
// mientras el mensaje se encola en el canal interno.

package kafka

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/plain"
	"github.com/urbanflow/telemetry-ingest-ms/internal/config"
)

// Producer encapsula el writer de Kafka y el canal de mensajes asíncronos.
type Producer struct {
	writer *kafka.Writer
	// Canal interno de trabajo para publicación asíncrona sin bloquear
	queue chan kafka.Message
}

// NewProducer crea un productor Kafka con autenticación SASL/PLAIN + TLS para Upstash.
func NewProducer(cfg *config.Config) (*Producer, error) {
	mechanism := plain.Mechanism{
		Username: cfg.KafkaUsername,
		Password: cfg.KafkaPassword,
	}

	writer := &kafka.Writer{
		Addr:  kafka.TCP(cfg.KafkaBrokers),
		Topic: cfg.KafkaTopicGPS,
		Transport: &kafka.Transport{
			SASL: mechanism,
			TLS:  &tls.Config{},
		},
		// Balanceo por hash de vehicle_id para mantener orden por vehículo
		Balancer:     &kafka.Hash{},
		RequiredAcks: kafka.RequireOne,
		Async:        true,
	}

	p := &Producer{
		writer: writer,
		queue:  make(chan kafka.Message, 10000),
	}

	// Worker goroutine que drena el canal y envía a Kafka en lotes
	go p.drainQueue()

	return p, nil
}

// Publish serializa el payload y lo encola para publicación asíncrona.
func (p *Producer) Publish(payload interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error serializando payload: %v", err)
		return
	}
	p.queue <- kafka.Message{
		Value: data,
		Time:  time.Now(),
	}
}

// drainQueue consume el canal interno y escribe en Kafka en micro-lotes de 100 mensajes.
func (p *Producer) drainQueue() {
	batch := make([]kafka.Message, 0, 100)
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case msg := <-p.queue:
			batch = append(batch, msg)
			if len(batch) >= 100 {
				p.flush(batch)
				batch = batch[:0]
			}
		case <-ticker.C:
			if len(batch) > 0 {
				p.flush(batch)
				batch = batch[:0]
			}
		}
	}
}

func (p *Producer) flush(messages []kafka.Message) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := p.writer.WriteMessages(ctx, messages...); err != nil {
		log.Printf("Error enviando %d mensajes a Kafka: %v", len(messages), err)
	}
}

// Close cierra limpiamente el writer de Kafka.
func (p *Producer) Close() error {
	return p.writer.Close()
}
