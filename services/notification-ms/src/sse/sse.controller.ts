// sse.controller.ts — Controlador Server-Sent Events (SSE) para el dashboard de la alcaldía.
// El panel de analítica consume este stream para mostrar KPIs en tiempo real:
// flujo por corredor, puntualidad, emisiones CO2 evitadas y ocupación promedio.
// SSE es unidireccional (servidor → cliente), sin overhead de WebSocket.

import { Request, Response } from 'express';
import { WebSocketGateway } from '../websocket/gateway';

export class SseController {
  // Clientes SSE conectados (ej: múltiples operadores del centro de control)
  private clients: Set<Response> = new Set();

  constructor(private wsGateway: WebSocketGateway) {}

  /** Abre el stream SSE y mantiene la conexión viva con heartbeats cada 15 segundos. */
  stream(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    this.clients.add(res);

    // Heartbeat para mantener la conexión HTTP viva y evitar timeouts de proxies
    const heartbeat = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      this.clients.delete(res);
    });
  }

  /** Envía un evento SSE con nombre y datos a todos los clientes del dashboard. */
  emit(eventName: string, data: object) {
    const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      client.write(payload);
    }
  }
}
