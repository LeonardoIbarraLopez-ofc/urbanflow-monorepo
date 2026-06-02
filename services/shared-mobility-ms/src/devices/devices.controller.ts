// devices.controller.ts — Endpoints REST para gestión de scooters y bicicletas.
// GET /devices/nearby?lat=&lon=&radius= — Lista dispositivos disponibles cercanos
// GET /devices/:id — Estado actual de un dispositivo específico

import { Router, Request, Response } from 'express';

const router = Router();

// GET /devices/nearby — Scooters y bicicletas disponibles en el área del ciudadano
router.get('/nearby', async (req: Request, res: Response) => {
  const { lat, lon, radius } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat y lon son requeridos' });
  }
  // TODO: Conectar con DevicesService y MongoDB Atlas
  res.json({
    message: 'Mock: dispositivos cercanos',
    devices: [
      {
        device_id: 'scooter_mock_001',
        type: 'scooter',
        battery_level: 85,
        status: 'available',
        current_location: { type: 'Point', coordinates: [parseFloat(lon as string), parseFloat(lat as string)] },
      },
    ],
  });
});

// GET /devices/:id — Estado de un dispositivo específico
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Consultar MongoDB Atlas por device_id
  res.json({ device_id: id, status: 'available', battery_level: 75 });
});

export default router;
