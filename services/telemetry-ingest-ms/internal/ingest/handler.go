// handler.go — Lógica de recepción y validación de payloads GPS de buses y metros.
// Soporta dos canales de entrada:
//   - HTTP POST /telemetry : payload JSON para buses con hardware moderno
//   - UDP raw              : payload binario compacto para buses legacy
// Tras validar, delega la publicación asíncrona al productor Kafka.

package ingest

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/urbanflow/telemetry-ingest-ms/internal/kafka"
)

// GPSPayload es la estructura de telemetría GPS esperada vía HTTP.
type GPSPayload struct {
	VehicleID    string    `json:"vehicle_id"`
	RouteID      string    `json:"route_id"`
	Latitude     float64   `json:"latitude"`
	Longitude    float64   `json:"longitude"`
	SpeedKmh     float32   `json:"speed_kmh"`
	Bearing      int       `json:"bearing"`
	RecordedAt   time.Time `json:"recorded_at"`
	DelayMinutes *float32  `json:"delay_minutes,omitempty"`
}

// Handler gestiona los servidores HTTP y UDP de ingesta.
type Handler struct {
	producer *kafka.Producer
}

func NewHandler(producer *kafka.Producer) *Handler {
	return &Handler{producer: producer}
}

// HTTPMux retorna el router HTTP con los endpoints de ingesta.
func (h *Handler) HTTPMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /telemetry", h.handleHTTP)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})
	return mux
}

// handleHTTP procesa telemetría GPS en formato JSON vía HTTP.
func (h *Handler) handleHTTP(w http.ResponseWriter, r *http.Request) {
	var payload GPSPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "payload inválido", http.StatusBadRequest)
		return
	}
	if err := validate(payload); err != nil {
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}
	// Publicar de forma asíncrona; no bloquea la respuesta HTTP
	go h.producer.Publish(payload)
	w.WriteHeader(http.StatusAccepted)
}

// ListenUDP escucha datagrams UDP compactos de sensores GPS legacy.
func (h *Handler) ListenUDP(port string) error {
	addr, err := net.ResolveUDPAddr("udp", ":"+port)
	if err != nil {
		return err
	}
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		return err
	}
	defer conn.Close()

	buf := make([]byte, 512)
	for {
		n, remoteAddr, err := conn.ReadFromUDP(buf)
		if err != nil {
			log.Printf("Error leyendo UDP desde %v: %v", remoteAddr, err)
			continue
		}
		// Parsear payload UDP binario y publicar en Kafka
		payload, err := parseUDPPayload(buf[:n])
		if err != nil {
			log.Printf("Payload UDP inválido desde %v: %v", remoteAddr, err)
			continue
		}
		go h.producer.Publish(payload)
	}
}

// parseUDPPayload convierte el buffer binario recibido por UDP en un GPSPayload.
// Formato esperado: JSON compacto codificado en UTF-8 (< 512 bytes).
func parseUDPPayload(data []byte) (GPSPayload, error) {
	var payload GPSPayload
	err := json.Unmarshal(data, &payload)
	return payload, err
}

// validate comprueba que los campos críticos del payload GPS estén presentes y sean válidos.
func validate(p GPSPayload) error {
	if p.VehicleID == "" || p.RouteID == "" {
		return fmt.Errorf("vehicle_id y route_id son obligatorios")
	}
	if p.Latitude < -90 || p.Latitude > 90 {
		return fmt.Errorf("latitud fuera de rango")
	}
	if p.Longitude < -180 || p.Longitude > 180 {
		return fmt.Errorf("longitud fuera de rango")
	}
	return nil
}
