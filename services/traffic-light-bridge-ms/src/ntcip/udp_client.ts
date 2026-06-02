// udp_client.ts — Cliente UDP para transmitir frames NTCIP binarios a controladores físicos.
// Cada controlador tiene una IP:Puerto asignado en el mapa de configuración.
// La transmisión es "fire and forget" pero registra errores de red.

import * as dgram from 'dgram';

export class UdpClient {
  constructor(
    // Mapa de controllerId (string) → "ip:puerto" del semáforo físico
    private readonly controllerMap: Record<string, string>,
  ) {}

  /**
   * Envía el buffer NTCIP binario al controlador físico del semáforo.
   * Resuelve la IP y puerto del mapa de configuración por controllerId.
   */
  async send(controllerId: number, frame: Buffer): Promise<void> {
    const key = String(controllerId);
    const address = this.controllerMap[key];

    if (!address) {
      console.warn(`Semáforo ${controllerId} no encontrado en el mapa de controladores`);
      return;
    }

    const [host, portStr] = address.split(':');
    const port = parseInt(portStr, 10);

    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket('udp4');
      socket.send(frame, port, host, (err) => {
        socket.close();
        if (err) {
          console.error(`Error UDP al semáforo ${controllerId} (${address}): ${err.message}`);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
