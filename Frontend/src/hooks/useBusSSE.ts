import { useEffect } from 'react';
import { useMapStore } from '../store/useMapStore';
import { API_CONFIG } from '../config/api.config';

// Mock initial buses to show something immediately
const MOCK_BUSES = [
  { bus_id: 'B-101', lat: -33.4489, lng: -70.6693, speed_kmh: 40, route_id: 'R-401', next_stop_id: 'S-20', next_stop_eta_seconds: 120, timestamp: new Date().toISOString() },
  { bus_id: 'B-202', lat: -33.4500, lng: -70.6700, speed_kmh: 35, route_id: 'R-402', next_stop_id: 'S-21', next_stop_eta_seconds: 90, timestamp: new Date().toISOString() },
];

export function useBusSSE() {
  const updateBus = useMapStore(state => state.updateBus);
  const setBuses = useMapStore(state => state.setBuses);

  useEffect(() => {
    // Inject mock buses immediately
    setBuses(MOCK_BUSES);

    try {
      const eventSource = new EventSource(`${API_CONFIG.TELEMETRY}/v1/buses/live-stream`);
      
      eventSource.onmessage = (event) => {
        try {
          const busData = JSON.parse(event.data);
          updateBus(busData);
        } catch (e) {
          console.error("Failed to parse bus SSE data", e);
        }
      };

      eventSource.onerror = (err) => {
        console.error("Bus SSE error", err);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (e) {
      console.error("Could not connect to SSE", e);
      
      // MOCK BEHAVIOR: move buses slightly if SSE fails (offline development)
      const interval = setInterval(() => {
        useMapStore.getState().buses.forEach(bus => {
          updateBus({
            ...bus,
            lat: bus.lat + (Math.random() - 0.5) * 0.001,
            lng: bus.lng + (Math.random() - 0.5) * 0.001,
            timestamp: new Date().toISOString()
          });
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [updateBus, setBuses]);
}
