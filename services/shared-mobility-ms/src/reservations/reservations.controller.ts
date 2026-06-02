// reservations.controller.ts — Endpoints REST para reserva de scooters y bicicletas.
// POST /reservations/reserve — Reserva atómica con bloqueo Redis NX PX
// DELETE /reservations/:deviceId — Cancela y libera el bloqueo Redis

import { Router, Request, Response } from 'express';
import { ReservationsService } from './reservations.service';
import { loadConfig } from '../config';

const router = Router();
const config = loadConfig();
const reservationsService = new ReservationsService(config.redisUrl, config.redisToken);

// POST /reservations/reserve — El primer usuario en llamar obtiene la reserva
router.post('/reserve', async (req: Request, res: Response) => {
  const { deviceId, userId } = req.body;
  if (!deviceId || !userId) {
    return res.status(400).json({ error: 'deviceId y userId son requeridos' });
  }

  const acquired = await reservationsService.reserve(deviceId, userId);

  if (acquired) {
    // Reserva exitosa — TODO: actualizar status en MongoDB Atlas
    return res.status(200).json({
      success: true,
      message: `Dispositivo ${deviceId} reservado para usuario ${userId}`,
      deviceId,
      userId,
    });
  } else {
    // El dispositivo ya está reservado por otro usuario (bloqueo Redis activo)
    return res.status(409).json({
      success: false,
      message: `Dispositivo ${deviceId} no disponible; ya reservado por otro usuario`,
    });
  }
});

// DELETE /reservations/:deviceId — Cancelar reserva y liberar lock Redis
router.delete('/:deviceId', async (req: Request, res: Response) => {
  const { deviceId } = req.params;
  await reservationsService.release(deviceId);
  res.json({ success: true, message: `Reserva de ${deviceId} cancelada` });
});

export default router;
