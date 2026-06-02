// gateway.ts — Gateway WebSocket para enviar alertas push personalizadas a ciudadanos.
// Cada cliente se registra indicando su ruta activa (route_id).
// Al recibir un evento de congestión de Kafka, solo notifica a los clientes
// cuya ruta activa intersecta el corredor afectado (RF-07: solo durante viaje activo).

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, Server } from 'http';
import { Kafka, Consumer } from 'kafkajs';
import { Config } from '../config';

interface ClientSession {
  ws: WebSocket;
  activeRouteId: string;  // Ruta activa del ciudadano durante su viaje
  userId: string;
}

export class WebSocketGateway {
  private wss: WebSocketServer;
  private sessions: Map<string, ClientSession> = new Map();
  private consumer: Consumer;

  constructor(server: Server, config: Config) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
    this.consumer = this.createKafkaConsumer(config);
    this.startConsuming(config);
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId') ?? 'anonymous';
      const activeRouteId = url.searchParams.get('routeId') ?? '';

      // Registrar la sesión del ciudadano con su ruta activa
      this.sessions.set(userId, { ws, activeRouteId, userId });
      console.log(`Ciudadano ${userId} conectado. Ruta activa: ${activeRouteId}`);

      ws.on('close', () => {
        this.sessions.delete(userId);
        console.log(`Ciudadano ${userId} desconectado`);
      });
    });
  }

  /** Envía una alerta de re-enrutamiento a todos los ciudadanos en el corredor afectado. */
  broadcast(corridorId: string, alert: object) {
    for (const session of this.sessions.values()) {
      if (session.activeRouteId === corridorId && session.ws.readyState === WebSocket.OPEN) {
        session.ws.send(JSON.stringify({ type: 'REROUTE_ALERT', ...alert }));
      }
    }
  }

  get connectionCount(): number {
    return this.sessions.size;
  }

  private createKafkaConsumer(config: Config): Consumer {
    const kafka = new Kafka({
      brokers: [config.kafkaBrokers],
      ssl: true,
      sasl: { mechanism: 'plain', username: config.kafkaUsername, password: config.kafkaPassword },
    });
    return kafka.consumer({ groupId: 'notification-ws-group' });
  }

  private async startConsuming(config: Config) {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: [config.kafkaTopicCongestion, config.kafkaTopicReroute] });
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());
        // Notificar a ciudadanos en la ruta/corredor afectado
        const corridorId = event.corridor_id ?? event.route_id;
        if (corridorId) this.broadcast(corridorId, event);
      },
    });
  }
}
