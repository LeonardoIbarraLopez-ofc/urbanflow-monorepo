import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { useUserStore } from '../store/useUserStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { API_CONFIG } from '../config/api.config';

const MAX_RETRIES = 10;

export function useNotificationWS(role: 'citizen' | 'operator' = 'citizen') {
  const addNotification = useNotificationStore(state => state.addNotification);
  const userId = useUserStore(state => state.userId);
  const endRoutingTimer = useSimulatorStore(state => state.endRoutingTimer);
  const addLog = useSimulatorStore(state => state.addLog);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let backoff = 1000;
    let retryCount = 0;

    const connect = () => {
      if (retryCount >= MAX_RETRIES) {
        console.warn(`[WS] notification-ms no disponible — reintentos agotados (${MAX_RETRIES}). Se reconectará cuando el servicio esté corriendo.`);
        return;
      }

      try {
        const wsUrl = `${API_CONFIG.NOTIFICATION_WS}?user_id=${userId}&role=${role}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(`[WS] Conectado como ${role}`);
          backoff = 1000;
          retryCount = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            data.id = Math.random().toString(36).substring(7);
            addNotification(data);

            if (data.type === 'BUS_REROUTED') {
              endRoutingTimer();
              addLog(`[WS] Received BUS_REROUTED event`);
            } else {
              addLog(`[WS] Received event: ${data.type}`);
            }
          } catch (e) {
            console.error('[WS] Parse error', e);
          }
        };

        ws.onclose = () => {
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            reconnectTimeout = setTimeout(connect, backoff);
            backoff = Math.min(backoff * 2, 8000);
          } else {
            console.warn(`[WS] notification-ms no disponible en ${API_CONFIG.NOTIFICATION_WS} — reintentos agotados.`);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        console.warn('[WS] Setup fallido — notification-ms no está corriendo.');
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      retryCount = MAX_RETRIES; // evita reconexión tras unmount
      if (wsRef.current) wsRef.current.close();
    };
  }, [addNotification, userId, role, endRoutingTimer, addLog]);
}
