export interface RouteSegment {
  mode: 'BUS' | 'METRO' | 'SCOOTER' | 'WALK';
  from_stop: string;
  to_stop: string;
  duration_minutes: number;
  cost_usd: number;
  co2_grams: number;
}

export interface Route {
  route_id: string;
  segments: RouteSegment[];
  total_time_minutes: number;
  total_cost_usd: number;
  total_co2_grams: number;
}

export interface RouteRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  preferences: { optimize: 'time' | 'cost' | 'eco' };
}

export interface RouteResponse {
  routes: Route[];
}
