export interface Scooter {
  id: string;
  lat: number;
  lng: number;
  battery_percent: number;
  status: string;
}

export interface ScooterAvailableResponse {
  scooters: Scooter[];
}

export interface ScooterReserveRequest {
  scooter_id: string;
  user_id: string;
}

export interface ScooterReserveResponse {
  success: boolean;
  lock_token?: string;
  error?: 'ALREADY_RESERVED';
}
