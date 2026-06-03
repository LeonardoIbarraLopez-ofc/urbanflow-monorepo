// reservations.controller.ts — Endpoints REST para reserva de scooters y bicicletas.
import express = require('express');
const router = express.Router();

// 1. Importación de VALORES (Clases y funciones para ejecutar en tiempo de ejecución)
import reservationsServiceModule = require('./reservations.service');
const { ReservationsService } = reservationsServiceModule;

import devicesServiceModule = require('../devices/devices.service');
const { DevicesService } = devicesServiceModule;

import configModule = require('../config');
const { loadConfig } = configModule;

// 2. MODIFICACIÓN: Importación de TIPOS estáticos independientes (Cumple con verbatimModuleSyntax)
import type { DevicesService as DevicesServiceType } from '../devices/devices.service';
import type { MongoClient } from 'mongodb';

const config = loadConfig();
const reservationsService = new ReservationsService(config.redisUrl, config.redisToken);

// 3. MODIFICACIÓN: Usamos el alias del tipo importado para la declaración de la variable
let devicesService: DevicesServiceType;

// 4. MODIFICACIÓN: Aplicamos el tipo correcto al parámetro del inicializador
function initReservationsRouter(mongoClient: MongoClient): express.Router {
  devicesService = new DevicesService(mongoClient);
  return router;
}

// POST /reservations/reserve — El primer usuario en llamar obtiene la reserva
router.post('/reserve', async (req: express.Request, res: express.Response) => {
  const { deviceId, userId } = req.body;
  if (!deviceId || !userId) {
    return res.status(400).json({ error: 'deviceId y userId son requeridos' });
  }

  // Aserción explícita de tipos para evitar errores de tipo 'string | undefined'
  const targetDevice = deviceId as string;
  const targetUser = userId as string;

  // 1. Intentar adquirir el candado atómico en Redis (Criterio 2.2)
  const acquired = await reservationsService.reserve(targetDevice, targetUser);

  if (acquired) {
    try {
      // 2. Actualizar obligatoriamente el status en MongoDB Atlas
      await devicesService.updateStatus(targetDevice, 'reserved');

      return res.status(200).json({
        success: true,
        message: `Dispositivo ${targetDevice} reservado para usuario ${targetUser}`,
        deviceId: targetDevice,
        userId: targetUser,
      });
    } catch (error) {
      // Si Mongo falla, hacemos rollback del lock en Redis para evitar inconsistencias
      await reservationsService.release(targetDevice);
      return res.status(500).json({ error: 'Error al persistir la reserva en el Data Lake' });
    }
  } else {
    // El dispositivo ya está reservado por otro usuario (bloqueo Redis activo)
    return res.status(409).json({
      success: false,
      message: `Dispositivo ${targetDevice} no disponible; ya reservado por otro usuario`,
    });
  }
});

// DELETE /reservations/:deviceId — Cancelar reserva y liberar lock Redis + MongoDB
router.delete('/:deviceId', async (req: express.Request, res: express.Response) => {
  const { deviceId } = req.params;
  
  if (!deviceId) {
    return res.status(400).json({ error: 'El parámetro deviceId es requerido' });
  }

  const targetDevice = deviceId as string;
  
  try {
    await reservationsService.release(targetDevice);
    await devicesService.updateStatus(targetDevice, 'available');
    
    return res.json({ success: true, message: `Reserva de ${targetDevice} cancelada con éxito` });
  } catch (error) {
    return res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
});

// Exportación unificada estilo CommonJS compatible con verbatimModuleSyntax
const controllerExports = {
  router,
  initReservationsRouter
};

export = controllerExports;