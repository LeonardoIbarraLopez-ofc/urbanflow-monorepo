import express = require('express');

// CORRECCIÓN: Cambiar los imports destructurados a formato CommonJS puro
import configModule = require('./config');
const { loadConfig } = configModule;

import mongodb = require('mongodb');
const { MongoClient } = mongodb;

// Importación CommonJS estricta de tus controladores locales
import reservationsController = require('./reservations/reservations.controller');
import devicesRouter = require('./devices/devices.controller'); 

// CORRECCIÓN DE TIPOS: Para que TypeScript no chille con el tipo de MongoClient e indexar el linter
import type { MongoClient as MongoClientType } from 'mongodb';

const app = express();
const config = loadConfig();

app.use(express.json());

const mongoClient: MongoClientType = new MongoClient(config.mongoUri);

async function bootstrap() {
  try {
    await mongoClient.connect();
    console.log('📦 Conectado con éxito a MongoDB Atlas (Persistencia Políglota)');

    // Inicializamos usando la nueva exportación unificada
    reservationsController.initReservationsRouter(mongoClient);

    // Registrar rutas montadas
    // Cambia esto en tu bloque de rutas dentro de bootstrap():
    app.use('/devices', devicesRouter.default || devicesRouter);
    app.use('/reservations', reservationsController.router);

    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', service: 'shared-mobility-ms' });
    });

    app.listen(config.port, () => {
      console.log(`🚀 shared-mobility-ms corriendo en puerto ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar el microservicio:', error);
    process.exit(1);
  }
}

bootstrap();

export = app;