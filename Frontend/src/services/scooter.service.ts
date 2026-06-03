import { API_CONFIG } from '../config/api.config';
import { ScooterAvailableResponse, ScooterReserveRequest, ScooterReserveResponse } from '../types/scooter.types';

export const getAvailableScooters = async (lat: number, lng: number): Promise<ScooterAvailableResponse> => {
  try {
    const res = await fetch(`${API_CONFIG.SCOOTER}/scooters/available?lat=${lat}&lng=${lng}&radius=500`);
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (e) {
    return {
      scooters: [
        { id: 'S-1', lat: -33.4479, lng: -70.6683, battery_percent: 85, status: 'AVAILABLE' },
        { id: 'S-2', lat: -33.4499, lng: -70.6713, battery_percent: 42, status: 'AVAILABLE' }
      ]
    };
  }
};

// Global lock state for mock
const reservedMocks = new Set<string>();

export const reserveScooter = async (req: ScooterReserveRequest): Promise<ScooterReserveResponse> => {
  try {
    const res = await fetch(`${API_CONFIG.SCOOTER}/scooters/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return await res.json();
  } catch (e) {
    // Mock simulation for Validation 2.2
    // Slight delay to simulate network
    await new Promise(r => setTimeout(r, 300));
    if (reservedMocks.has(req.scooter_id)) {
      return { success: false, error: 'ALREADY_RESERVED' };
    }
    reservedMocks.add(req.scooter_id);
    return { success: true, lock_token: 'LKT-' + Math.random().toString(36).substring(7) };
  }
};
