// devices.service.ts — Lógica de acceso a MongoDB Atlas para la colección shared_devices.
// Gestiona disponibilidad, estado y ubicación geoespacial de scooters y bicicletas.
// Usa índice 2dsphere para consultas de proximidad geoespacial eficientes.

import { MongoClient, Collection, ObjectId } from 'mongodb';

export type DeviceStatus = 'available' | 'reserved' | 'in_use' | 'maintenance';

export interface SharedDevice {
  _id?: ObjectId;
  device_id: string;
  provider: string;
  type: 'scooter' | 'bicycle';
  battery_level: number;
  status: DeviceStatus;
  current_location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  geofence_zone_id: string;
  last_reported_at: Date;
}

export class DevicesService {
  private collection: Collection<SharedDevice>;

  constructor(mongoClient: MongoClient) {
    const db = mongoClient.db('urbanflow');
    this.collection = db.collection<SharedDevice>('shared_devices');
    // Índice 2dsphere para consultas geoespaciales de dispositivos cercanos
    this.collection.createIndex({ current_location: '2dsphere' });
  }

  /** Encuentra dispositivos disponibles en un radio dado (metros). */
  async findNearby(lat: number, lon: number, radiusMeters = 500): Promise<SharedDevice[]> {
    return this.collection.find({
      status: 'available',
      current_location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lon, lat] },
          $maxDistance: radiusMeters,
        },
      },
    }).limit(20).toArray();
  }

  /** Actualiza el estado de un dispositivo (reservado, en uso, disponible, etc.) */
  async updateStatus(deviceId: string, status: DeviceStatus): Promise<void> {
    await this.collection.updateOne(
      { device_id: deviceId },
      { $set: { status, last_reported_at: new Date() } },
    );
  }
}
