// reservations.service.ts — Lógica de reserva con bloqueo distribuido Redis.
// Implementa el patrón SET NX PX para evitar reservas concurrentes del mismo scooter.
// Validación 2.2: dos usuarios simultáneos → solo el primero obtiene el lock; el segundo recibe rechazo.
//
// Flujo:
//   1. SET resource:device_id "user_id" NX PX 60000
//   2. Si OK → actualizar MongoDB con status='reserved'
//   3. Si null → el dispositivo ya está reservado por otro usuario

import { Redis } from '@upstash/redis';

export class ReservationsService {
  private redis: Redis;

  constructor(redisUrl: string, redisToken: string) {
    this.redis = new Redis({ url: redisUrl, token: redisToken });
  }

  /**
   * Intenta reservar el dispositivo para el usuario.
   * Retorna true si la reserva fue exitosa, false si ya estaba tomada.
   * El bloqueo expira automáticamente en 60 segundos (TTL) si el usuario no confirma.
   */
  async reserve(deviceId: string, userId: string): Promise<boolean> {
    const lockKey = `resource:${deviceId}`;
    const lockTtlMs = 60000; // 60 segundos según especificación

    // SET NX PX: atómico, solo escribe si la clave NO existe
    const result = await this.redis.set(lockKey, userId, {
      nx: true,      // Solo si Not eXists
      px: lockTtlMs, // Expiración en milisegundos
    });

    // 'OK' = lock adquirido; null = ya existía (otro usuario tiene el lock)
    return result === 'OK';
  }

  /** Libera el bloqueo Redis al finalizar o cancelar la reserva. */
  async release(deviceId: string): Promise<void> {
    await this.redis.del(`resource:${deviceId}`);
  }
}
