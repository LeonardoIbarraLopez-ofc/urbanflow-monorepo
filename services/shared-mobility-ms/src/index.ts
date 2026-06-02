// index.ts — Punto de entrada de shared-mobility-ms (Node/Express).
// Gestiona disponibilidad, reservas, desbloqueo y reportes de scooters y bicicletas.
// Usa MongoDB Atlas para persistencia y Upstash Redis para bloqueos distribuidos de reserva.

import express from 'express';
import { loadConfig } from './config';
import devicesRouter from './devices/devices.controller';
import reservationsRouter from './reservations/reservations.controller';

const app = express();
const config = loadConfig();

app.use(express.json());

// Endpoints de gestión de dispositivos (scooters y bicicletas)
app.use('/devices', devicesRouter);

// Endpoints de reservas con bloqueo distribuido Redis
app.use('/reservations', reservationsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'shared-mobility-ms' });
});

app.listen(config.port, () => {
  console.log(`shared-mobility-ms corriendo en puerto ${config.port}`);
});

export default app;
