# main.py — API FastAPI de diagnóstico y predicción de congestión vial.
# Expone endpoints para consultar el estado actual de predicción por corredor.
# El consumidor Kafka (stream_listener.py) corre en un thread separado y alimenta el estado.

import threading
from fastapi import FastAPI
from app.kafka.stream_listener import StreamListener
from app.model.predictor import CongestionPredictor

app = FastAPI(
    title="UrbanFlow Congestion Predictor",
    description="Predice congestión vial con 30 minutos de anticipación usando modelo autorregresivo. Publica en Kafka cuando densidad D(t+30) > 85%.",
    version="1.0.0",
)

predictor = CongestionPredictor()
listener = StreamListener(predictor)

@app.on_event("startup")
async def startup():
    # Iniciar el consumer Kafka en un thread daemon para no bloquear la API
    thread = threading.Thread(target=listener.start, daemon=True)
    thread.start()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "congestion-predictor-ms"}


@app.get("/corridors/{corridor_id}/prediction")
async def get_prediction(corridor_id: str):
    """Retorna la predicción de densidad de tráfico para el corredor en los próximos 30 min."""
    prediction = predictor.get_latest(corridor_id)
    if prediction is None:
        return {"corridor_id": corridor_id, "predicted_density": None, "status": "no_data"}
    return prediction
