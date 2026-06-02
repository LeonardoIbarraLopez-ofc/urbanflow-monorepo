// index.ts — Punto de entrada de notification-ms.
// Servidor Node.js que combina:
//   - WebSocket Server (ws): alertas de re-enrutamiento en tiempo real para ciudadanos
//   - SSE endpoint (HTTP): stream de eventos para el dashboard de la alcaldía
// Consume el tópico Kafka 'traffic.congestion.predicted' y 'bus.reroute.command'.

import http from 'http';
import express from 'express';
import { WebSocketGateway } from './websocket/gateway';
import { SseController } from './sse/sse.controller';
import { loadConfig } from './config';

const app = express();
const server = http.createServer(app);
const config = loadConfig();

// Inicializar el gateway WebSocket y el controlador SSE
const wsGateway = new WebSocketGateway(server, config);
const sseController = new SseController(wsGateway);

app.use(express.json());

// Endpoint SSE para el dashboard de la alcaldía (KPIs en tiempo real)
app.get('/events', sseController.stream.bind(sseController));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notification-ms', connections: wsGateway.connectionCount });
});

server.listen(config.port, () => {
  console.log(`notification-ms corriendo en puerto ${config.port}`);
  console.log(`WebSocket disponible en ws://localhost:${config.port}`);
  console.log(`SSE disponible en http://localhost:${config.port}/events`);
});
