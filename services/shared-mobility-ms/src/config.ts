// config.ts — Variables de entorno para shared-mobility-ms.
import dotenv = require('dotenv');
import path = require('path');

// MODIFICACIÓN CRÍTICA: Forzar la ruta absoluta hacia el archivo .env de la carpeta actual
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// DEFINICIÓN DE TIPOS: No lleva la palabra clave 'export' al inicio
interface Config {
  port: number;
  mongoUri: string;
  redisUrl: string;
  redisToken: string;
  reservationLockTtlMs: number;
}

function loadConfig(): Config {
  return {
    port: parseInt(process.env.MOBILITY_PORT ?? '3000', 10),
    mongoUri: requireEnv('MONGODB_URI'),
    redisUrl: requireEnv('UPSTASH_REDIS_URL'),
    redisToken: requireEnv('UPSTASH_REDIS_TOKEN'),
    reservationLockTtlMs: parseInt(
      process.env.RESERVATION_LOCK_TTL_MS ?? '60000',
      10,
    ),
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variable de entorno requerida: ${key}`);
  return value;
}

// MODIFICACIÓN DE EXPORTACIÓN: Formato CommonJS puro compatible con verbatimModuleSyntax
const configExports = {
  loadConfig
};

export = configExports;