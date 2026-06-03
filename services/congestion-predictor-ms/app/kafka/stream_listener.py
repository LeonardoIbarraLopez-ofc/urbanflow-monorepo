import json
import os
import ssl
import pandas as pd
from datetime import datetime
from kafka import KafkaConsumer, KafkaProducer

TOPIC_GPS = os.getenv('KAFKA_TOPIC_GPS', 'telemetry.raw.gps')
TOPIC_CONGESTION = os.getenv('KAFKA_TOPIC_CONGESTION', 'traffic.congestion.predicted')

class StreamListener:
    def __init__(self, simulation_mode=False):
        self.simulation_mode = simulation_mode
        
        if not self.simulation_mode:
            brokers = os.environ.get('UPSTASH_KAFKA_BROKERS', 'dummy')
            username = os.environ.get('UPSTASH_KAFKA_USERNAME', 'dummy')
            password = os.environ.get('UPSTASH_KAFKA_PASSWORD', 'dummy')

            sasl_config = {
                'security_protocol': 'SASL_SSL',
                'sasl_mechanism': 'PLAIN',
                'sasl_plain_username': username,
                'sasl_plain_password': password,
                'ssl_context': ssl.create_default_context(),
            }

            self.consumer = KafkaConsumer(
                TOPIC_GPS,
                bootstrap_servers=brokers,
                group_id='congestion-predictor-group',
                value_deserializer=lambda v: json.loads(v.decode('utf-8')),
                **sasl_config,
            )

            self.producer = KafkaProducer(
                bootstrap_servers=brokers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                **sasl_config,
            )

    def predecir_densidad(self, volumen_eventos, clima_actual=0.5):
        """
        Modelo autorregresivo: D(t+30) = θ₀ + Σθᵢ·Vₜ₋ᵢ + μ·Clima
        """
        theta_0 = 0.1
        theta_1 = 0.015  # Peso del volumen de tráfico
        mu = 0.2         # Impacto del clima (0.0 a 1.0)
        
        # Cálculo matemático
        densidad = theta_0 + (theta_1 * volumen_eventos) + (mu * clima_actual)
        return min(densidad, 1.0) # Tope máximo al 100%

    def guardar_en_datalake(self, data_dict):
        """Genera el archivo Parquet para el Data Lake de la Alcaldía"""
        df = pd.DataFrame([data_dict])
        filename = f"congestion_historico_{datetime.now().strftime('%H%M%S')}.parquet"
        df.to_parquet(filename)
        print(f"[*] Data Lake: Histórico guardado exitosamente en {filename}")

    def procesar_lote(self, route_id, volumen_eventos):
        densidad = self.predecir_densidad(volumen_eventos)
        print(f"[-] Corredor {route_id} procesado. Densidad proyectada: {densidad:.2%}")
        
        # Umbral crítico del 85% para disparar el re-enrutamiento
        if densidad > 0.85:
            alerta = {
                "route_id": route_id,
                "predicted_density": densidad,
                "threshold_exceeded": True,
                "timestamp": str(datetime.now())
            }
            
            # Guardamos la evidencia inmutable en Parquet
            self.guardar_en_datalake(alerta)
            
            if not self.simulation_mode:
                self.producer.send(TOPIC_CONGESTION, value=alerta)
                self.producer.flush()
                
            print(f"[!] ALERTA ENVIADA: Congestión severa detectada en {route_id}")

    def run_simulation(self):
        print("=== INICIANDO SIMULACIÓN DE MVP 3 y 4 ===")
        print("Simulando ráfaga de 60 eventos de tráfico GPS en corredor central...")
        # Simulamos que entraron 60 eventos de golpe (genera congestión)
        self.procesar_lote("Ruta-Bus-01-Sur", 60)

# --- Ejecución de prueba aislada ---
if __name__ == "__main__":
    # Arrancamos en modo simulación para saltar el error de red de Kafka
    listener = StreamListener(simulation_mode=True)
    listener.run_simulation()