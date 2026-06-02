// config.ts — Variables de entorno para shared-mobility-ms.
// Credenciales de MongoDB Atlas (documentos) y Upstash Redis (bloqueos distribuidos).

export interface Config {
  port: number;
  mongoUri: string;
  redisUrl: string;
  redisToken: string;
  // TTL del bloqueo Redis para reservas: 60 segundos según especificación
  reservationLockTtlMs: number;
}

export function loadConfig(): Config {
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
