// reservations.service.ts — Lógica de reserva con bloqueo distribuido Redis.
import upstashRedis = require('@upstash/redis');
const { Redis } = upstashRedis;

// MODIFICACIÓN: Importación de tipos estáticos para cumplir con verbatimModuleSyntax
import type { Redis as RedisType } from '@upstash/redis';

class ReservationsService {
  private redis: RedisType;

  constructor(redisUrl: string, redisToken: string) {
    this.redis = new Redis({ url: redisUrl, token: redisToken });
  }

  /**
   * Intenta reservar el dispositivo para el usuario.
   * Retorna true si la reserva fue exitosa, false si ya estaba tomada.
   */
  async reserve(deviceId: string, userId: string): Promise<boolean> {
    const lockKey = `resource:${deviceId}`;
    const lockTtlMs = 60000; // 60 segundos según especificación

    // SET NX PX: atómico, solo escribe si la clave NO existe
    const result = await this.redis.set(lockKey, userId, {
      nx: true,      // Solo si Not eXists
      px: lockTtlMs, // Expiración en milisegundos
    });

    // '@upstash/redis' devuelve 'OK' si se creó la clave, o null si ya existía
    return result === 'OK';
  }

  /** Libera el bloqueo Redis al finalizar o cancelar la reserva. */
  async release(deviceId: string): Promise<void> {
    await this.redis.del(`resource:${deviceId}`);
  }
}

// MODIFICACIÓN: Exportación CommonJS pura compatible con el linter del monorepo
const serviceExports = {
  ReservationsService
};

export = serviceExports;