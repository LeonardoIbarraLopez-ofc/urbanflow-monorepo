// index.ts — Punto de entrada de traffic-light-bridge-ms.
// Inicia el consumidor Kafka que escucha comandos de re-enrutamiento de buses
// y los traduce a tramas binarias UDP NTCIP (<256 bytes) enviadas a semáforos físicos.

import { KafkaConsumer } from './kafka/consumer';
import { loadConfig } from './config';

async function main() {
  const config = loadConfig();
  const consumer = new KafkaConsumer(config);

  console.log('traffic-light-bridge-ms iniciado. Escuchando tópico:', config.kafkaTopicReroute);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Deteniendo consumer Kafka...');
    await consumer.disconnect();
    process.exit(0);
  });

  await consumer.connect();
  await consumer.start();
}

main().catch((err) => {
  console.error('Error fatal en traffic-light-bridge-ms:', err);
  process.exit(1);
});
