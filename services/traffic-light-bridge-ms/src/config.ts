// config.ts — Configuración de credenciales Kafka y mapa IP de controladores NTCIP.
// El mapa de semáforos asocia cada controllerId al par IP:Puerto UDP del hardware físico.

export interface AppConfig {
  kafkaBrokers: string;
  kafkaUsername: string;
  kafkaPassword: string;
  kafkaTopicReroute: string;
  // Mapa de semáforos: { "TL001": "192.168.10.1:10001" }
  ntcipControllerMap: Record<string, string>;
}

export function loadConfig(): AppConfig {
  return {
    kafkaBrokers: requireEnv('UPSTASH_KAFKA_BROKERS'),
    kafkaUsername: requireEnv('UPSTASH_KAFKA_USERNAME'),
    kafkaPassword: requireEnv('UPSTASH_KAFKA_PASSWORD'),
    kafkaTopicReroute: process.env.KAFKA_TOPIC_REROUTE ?? 'bus.reroute.command',
    ntcipControllerMap: JSON.parse(
      process.env.NTCIP_CONTROLLER_MAP ?? '{}',
    ) as Record<string, string>,
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variable de entorno requerida no definida: ${key}`);
  return value;
}
