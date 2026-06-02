// config.ts — Variables de entorno de notification-ms.
// Credenciales Kafka para consumir alertas de congestión y comandos de re-enrutamiento.

export interface Config {
  port: number;
  kafkaBrokers: string;
  kafkaUsername: string;
  kafkaPassword: string;
  kafkaTopicCongestion: string;
  kafkaTopicReroute: string;
}

export function loadConfig(): Config {
  return {
    port: parseInt(process.env.NOTIFICATION_PORT ?? '3000', 10),
    kafkaBrokers: requireEnv('UPSTASH_KAFKA_BROKERS'),
    kafkaUsername: requireEnv('UPSTASH_KAFKA_USERNAME'),
    kafkaPassword: requireEnv('UPSTASH_KAFKA_PASSWORD'),
    kafkaTopicCongestion: process.env.KAFKA_TOPIC_CONGESTION ?? 'traffic.congestion.predicted',
    kafkaTopicReroute: process.env.KAFKA_TOPIC_REROUTE ?? 'bus.reroute.command',
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variable de entorno requerida: ${key}`);
  return value;
}
