export interface BusTelemetryEvent {
  bus_id: string;
  lat: number;
  lng: number;
  speed_kmh: number;
  route_id: string;
  next_stop_id: string;
  next_stop_eta_seconds: number;
  timestamp: string;
}

export interface SimulatedGpsRequest {
  bus_id: string;
  lat: number;
  lng: number;
  speed_kmh: number;
}
