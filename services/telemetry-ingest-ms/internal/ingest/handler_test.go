// handler_test.go — Pruebas unitarias de validación de coordenadas GPS para telemetry-ingest-ms.
// Verifica que el handler rechace payloads inválidos y acepte los correctos.

package ingest

import (
	"testing"
	"time"
)

func TestValidate_ValidPayload(t *testing.T) {
	// Payload GPS completo y válido de un bus en servicio
	payload := GPSPayload{
		VehicleID:  "BUS-001",
		RouteID:    "ROUTE-42",
		Latitude:   -16.5000,
		Longitude:  -68.1500,
		SpeedKmh:   45.5,
		Bearing:    180,
		RecordedAt: time.Now().UTC(),
	}
	if err := validate(payload); err != nil {
		t.Errorf("Payload válido rechazado: %v", err)
	}
}

func TestValidate_MissingVehicleID(t *testing.T) {
	// Sin vehicle_id debe fallar la validación
	payload := GPSPayload{
		RouteID:   "ROUTE-42",
		Latitude:  -16.5000,
		Longitude: -68.1500,
	}
	if err := validate(payload); err == nil {
		t.Error("Se esperaba error por vehicle_id vacío")
	}
}

func TestValidate_InvalidLatitude(t *testing.T) {
	// Latitud fuera de rango (-90 a 90) debe rechazarse
	payload := GPSPayload{
		VehicleID: "BUS-001",
		RouteID:   "ROUTE-42",
		Latitude:  -91.0,
		Longitude: -68.1500,
	}
	if err := validate(payload); err == nil {
		t.Error("Se esperaba error por latitud inválida")
	}
}

func TestValidate_InvalidLongitude(t *testing.T) {
	// Longitud fuera de rango (-180 a 180) debe rechazarse
	payload := GPSPayload{
		VehicleID: "BUS-001",
		RouteID:   "ROUTE-42",
		Latitude:  -16.5000,
		Longitude: 200.0,
	}
	if err := validate(payload); err == nil {
		t.Error("Se esperaba error por longitud inválida")
	}
}

func TestParseUDPPayload_ValidJSON(t *testing.T) {
	// Payload UDP en formato JSON compacto debe parsear correctamente
	raw := []byte(`{"vehicle_id":"BUS-002","route_id":"ROUTE-1","latitude":-16.5,"longitude":-68.15,"speed_kmh":30.0,"bearing":90,"recorded_at":"2026-06-02T18:30:00Z"}`)
	payload, err := parseUDPPayload(raw)
	if err != nil {
		t.Fatalf("Error parseando UDP payload válido: %v", err)
	}
	if payload.VehicleID != "BUS-002" {
		t.Errorf("VehicleID esperado BUS-002, obtenido %s", payload.VehicleID)
	}
}
