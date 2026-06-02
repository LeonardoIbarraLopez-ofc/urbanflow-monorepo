// consumer.ts — Consumidor Kafka del tópico 'bus.reroute.command'.
// Cada mensaje contiene el ID del semáforo a priorizar y la fase a extender.
// Al recibir el mensaje, delega al encoder NTCIP y al cliente UDP para transmisión.

import { Kafka, Consumer } from 'kafkajs';
import { AppConfig } from '../config';
import { NtcipEncoder } from '../ntcip/encoder';
import { UdpClient } from '../ntcip/udp_client';

interface RerouteCommand {
  controllerId: number;
  commandType: number;
  phaseToExtend: number;
  durationSeconds: number;
  requestingVehicleId: string;
}

export class KafkaConsumer {
  private consumer: Consumer;
  private encoder: NtcipEncoder;
  private udpClient: UdpClient;

  constructor(private config: AppConfig) {
    const kafka = new Kafka({
      brokers: [config.kafkaBrokers],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: config.kafkaUsername,
        password: config.kafkaPassword,
      },
    });
    this.consumer = kafka.consumer({ groupId: 'traffic-light-bridge-group' });
    this.encoder = new NtcipEncoder();
    this.udpClient = new UdpClient(config.ntcipControllerMap);
  }

  async connect() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.config.kafkaTopicReroute,
      fromBeginning: false,
    });
  }

  async start() {
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const command: RerouteCommand = JSON.parse(message.value.toString());
        // Serializar a buffer binario NTCIP (<256 bytes)
        const binaryFrame = this.encoder.encode(command);
        // Transmitir vía UDP al controlador físico del semáforo
        await this.udpClient.send(command.controllerId, binaryFrame);
        console.log(`NTCIP enviado al semáforo ${command.controllerId} (${binaryFrame.length} bytes)`);
      },
    });
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}
