import { API_CONFIG } from '../config/api.config';
import { AnalyticsKPIs } from '../types/analytics.types';

export const getRealtimeKPIs = async (): Promise<AnalyticsKPIs> => {
  try {
    const res = await fetch(`${API_CONFIG.PREDICTOR}/v1/kpis/realtime`);
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (e) {
    return {
      events_per_second: 50200,
      punctuality_index_percent: 97.3,
      co2_avoided_kg_today: 2800,
      avg_occupancy_percent: 78
    };
  }
};

export const simulateCongestion = async (corridorId: string, density: number): Promise<boolean> => {
  try {
    const res = await fetch(`${API_CONFIG.PREDICTOR}/v1/simulate/congestion`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ corridor_id: corridorId, density_percent: density })
    });
    return res.ok;
  } catch (e) {
    return true; // Mock true
  }
};
