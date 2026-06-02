# stream_listener.py — Consumidor Kafka del tópico 'telemetry.raw.gps'.
# Lee micro-lotes de eventos de velocidad de buses, calcula la velocidad promedio
# por corredor y alimenta el modelo de predicción.
# Si D(t+30) > 85%, publica un evento de congestión en 'traffic.congestion.predicted'.

import json
import os
import ssl
from kafka import KafkaConsumer, KafkaProducer
from app.model.predictor import CongestionPredictor

TOPIC_GPS = os.getenv('KAFKA_TOPIC_GPS', 'telemetry.raw.gps')
TOPIC_CONGESTION = os.getenv('KAFKA_TOPIC_CONGESTION', 'traffic.congestion.predicted')


class StreamListener:
    def __init__(self, predictor: CongestionPredictor):
        self.predictor = predictor
        brokers = os.environ['UPSTASH_KAFKA_BROKERS']
        username = os.environ['UPSTASH_KAFKA_USERNAME']
        password = os.environ['UPSTASH_KAFKA_PASSWORD']

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

    def start(self):
        """
        Loop principal: consume eventos GPS, agrupa por corredor,
        calcula velocidad promedio y actualiza el predictor.
        Si se detecta congestión (D > 85%), publica el evento en Kafka.
        """
        # Buffer de velocidades por corredor para calcular promedio por lote
        corridor_speeds: dict[str, list[float]] = {}

        for message in self.consumer:
            payload = message.value
            route_id = payload.get('route_id', 'unknown')
            speed = payload.get('speed_kmh', 0.0)

            if route_id not in corridor_speeds:
                corridor_speeds[route_id] = []
            corridor_speeds[route_id].append(speed)

            # Procesar en micro-lotes de 50 eventos por corredor
            if len(corridor_speeds[route_id]) >= 50:
                avg_speed = sum(corridor_speeds[route_id]) / len(corridor_speeds[route_id])
                corridor_speeds[route_id] = []

                prediction = self.predictor.update(route_id, avg_speed)

                # Publicar alerta de congestión si supera el umbral del 85%
                if prediction['threshold_exceeded']:
                    self.producer.send(TOPIC_CONGESTION, value=prediction)
                    self.producer.flush()
                    print(f"Alerta de congestión publicada para corredor {route_id}: D={prediction['predicted_density']:.2%}")
