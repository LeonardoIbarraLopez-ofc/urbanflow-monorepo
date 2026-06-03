import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { useUserStore } from '../store/useUserStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { API_CONFIG } from '../config/api.config';

export function useNotificationWS(role: 'citizen' | 'operator' = 'citizen') {
  const addNotification = useNotificationStore(state => state.addNotification);
  const userId = useUserStore(state => state.userId);
  const endRoutingTimer = useSimulatorStore(state => state.endRoutingTimer);
  const addLog = useSimulatorStore(state => state.addLog);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let backoff = 1000;

    const connect = () => {
      try {
        const wsUrl = `${API_CONFIG.NOTIFICATION_WS}?user_id=${userId}&role=${role}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(`WS Connected as ${role}`);
          backoff = 1000;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            data.id = Math.random().toString(36).substring(7); // Client ID
            addNotification(data);
            
            if (data.type === 'BUS_REROUTED') {
              endRoutingTimer(); // Important for simulator validation (MVP 1 + MVP 3.2 timer)
              addLog(`[WS] Received BUS_REROUTED event`);
            } else {
               addLog(`[WS] Received event: ${data.type}`);
            }
          } catch (e) {
            console.error("WS parse error", e);
          }
        };

        ws.onclose = () => {
          console.log("WS Closed, reconnecting...");
          reconnectTimeout = setTimeout(connect, backoff);
          backoff = Math.min(backoff * 2, 8000);
        };

        ws.onerror = (err) => {
          console.error("WS Error", err);
          ws.close();
        };
      } catch (e) {
         console.warn("WS setup failed (likely offline). Mocks will be used if needed.");
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [addNotification, userId, role, endRoutingTimer, addLog]);
}
