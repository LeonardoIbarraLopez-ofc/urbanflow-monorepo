import { useEffect } from 'react';
import { useMapStore } from '../store/useMapStore';
import { API_CONFIG } from '../config/api.config';

export function useCongestionsSSE() {
  const updateCongestion = useMapStore(state => state.updateCongestion);

  useEffect(() => {
    try {
      const eventSource = new EventSource(`${API_CONFIG.PREDICTOR}/v1/congestion/stream`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Only act on high density
          if (data.density_percent > 85) {
            updateCongestion(data);
          }
        } catch (e) {
          console.error("Failed to parse congestion SSE data", e);
        }
      };

      eventSource.onerror = (err) => {
        console.error("Congestion SSE error", err);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (e) {
      console.error("Could not connect to Congestion SSE", e);
    }
  }, [updateCongestion]);
}
