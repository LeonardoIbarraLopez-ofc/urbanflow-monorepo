/// <reference types="vite/client" />

export const API_CONFIG = {
  TELEMETRY: import.meta.env.VITE_TELEMETRY_MS_URL || 'http://localhost:3001',
  ROUTING: import.meta.env.VITE_ROUTING_MS_URL || 'http://localhost:3002',
  PAYMENT: import.meta.env.VITE_PAYMENT_MS_URL || 'http://localhost:3003',
  SCOOTER: import.meta.env.VITE_SCOOTER_MS_URL || 'http://localhost:3004',
  PREDICTOR: import.meta.env.VITE_PREDICTOR_MS_URL || 'http://localhost:3005',
  NOTIFICATION_WS: import.meta.env.VITE_NOTIFICATION_WS_URL || 'ws://localhost:3006',
  TRAFFIC_LIGHT: import.meta.env.VITE_TRAFFIC_LIGHT_MS_URL || 'http://localhost:3007',
  
  MAP: {
    TILE_URL: import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    DEFAULT_LAT: Number(import.meta.env.VITE_MAP_DEFAULT_LAT) || -33.4489,
    DEFAULT_LNG: Number(import.meta.env.VITE_MAP_DEFAULT_LNG) || -70.6693,
    DEFAULT_ZOOM: Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 13,
  },

  DUCKDB: {
    PARQUET_BASE_URL: import.meta.env.VITE_PARQUET_BASE_URL || 'https://supabase-storage-url/analytics'
  }
};
