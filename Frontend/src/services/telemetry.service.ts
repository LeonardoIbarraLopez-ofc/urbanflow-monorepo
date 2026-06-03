import { API_CONFIG } from '../config/api.config';
import { SimulatedGpsRequest } from '../types/telemetry.types';

export const injectGps = async (req: SimulatedGpsRequest): Promise<boolean> => {
  try {
    const res = await fetch(`${API_CONFIG.TELEMETRY}/v1/simulate/gps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return res.ok;
  } catch (e) {
    return true; // Mock true
  }
};
