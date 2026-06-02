// encoder.ts — Serialización de comandos JSON a tramas binarias NTCIP para semáforos.
// El buffer de salida DEBE ser < 256 bytes para cumplir con la restricción C-01
// de la red 4G celular privada de los controladores de semáforos (hardware de 20 años).
//
// Estructura del frame binario (7 bytes fijos):
//   [0]      magicByte      = 0x7E (inicio de trama NTCIP)
//   [1-2]    controllerId   = uint16 big-endian
//   [3]      commandType    = uint8 (0x03 = solicitud de fase prioritaria)
//   [4]      phaseToExtend  = uint8 (ID de la fase semafórica)
//   [5]      durationSeconds= uint8 (máx 30 segundos)
//   [6]      checksum       = CRC-8 de los bytes [0..5]

interface NtcipCommand {
  controllerId: number;
  commandType: number;
  phaseToExtend: number;
  durationSeconds: number;
}

export class NtcipEncoder {
  private static readonly MAGIC_BYTE = 0x7e;
  private static readonly MAX_DURATION = 30;
  private static readonly FRAME_SIZE = 7;

  encode(command: NtcipCommand): Buffer {
    const buf = Buffer.alloc(NtcipEncoder.FRAME_SIZE);

    buf.writeUInt8(NtcipEncoder.MAGIC_BYTE, 0);
    buf.writeUInt16BE(command.controllerId & 0xffff, 1);
    buf.writeUInt8(command.commandType & 0xff, 3);
    buf.writeUInt8(command.phaseToExtend & 0xff, 4);

    // Truncar la duración al máximo permitido por NTCIP
    const duration = Math.min(command.durationSeconds, NtcipEncoder.MAX_DURATION);
    buf.writeUInt8(duration, 5);

    // Calcular checksum CRC-8 de los primeros 6 bytes
    buf.writeUInt8(this.crc8(buf.slice(0, 6)), 6);

    // Validación de tamaño: el frame NUNCA debe exceder 256 bytes
    if (buf.length > 256) {
      throw new Error(`Frame NTCIP excede 256 bytes: ${buf.length} bytes`);
    }

    return buf;
  }

  /** CRC-8 estándar para verificación de integridad del frame NTCIP. */
  private crc8(data: Buffer): number {
    let crc = 0x00;
    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
      }
    }
    return crc;
  }
}
