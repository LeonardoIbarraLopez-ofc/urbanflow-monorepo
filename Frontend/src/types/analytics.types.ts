export interface AnalyticsKPIs {
  events_per_second: number;
  punctuality_index_percent: number;
  co2_avoided_kg_today: number;
  avg_occupancy_percent: number;
}

export interface CongestionEvent {
  corridor_id: string;
  corridor_name: string;
  density_percent: number;
  predicted_minutes_ahead: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}
