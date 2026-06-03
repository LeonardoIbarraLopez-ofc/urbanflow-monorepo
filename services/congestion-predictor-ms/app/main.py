# main.py — API FastAPI de diagnóstico y predicción de congestión vial.
# Expone endpoints para consultar el estado actual de predicción por corredor.
# El consumidor Kafka (stream_listener.py) corre en un thread separado y alimenta el estado.

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Congestion Predictor MS - Mock")

class TrafficData(BaseModel):
    corredor_id: str
    volumen_actual: int
    clima: float

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "congestion-predictor"}

@app.post("/v1/predict")
def predict_congestion(data: TrafficData):
    # Mock de la predicción: Simulamos una densidad del 88%
    prediccion_densidad = 0.88 
    
    return {
        "corredor_id": data.corredor_id,
        "densidad_predicha_t30": prediccion_densidad,
        "alerta_congestion": prediccion_densidad > 0.85
    }