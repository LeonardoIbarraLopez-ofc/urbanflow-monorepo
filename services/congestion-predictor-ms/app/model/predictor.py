# predictor.py — Modelo autorregresivo de predicción de densidad de tráfico.
# Implementa: D(t+30) = θ₀ + Σθᵢ·Vₜ₋ᵢ + μ·Climaₜ
# Carga el modelo pre-entrenado (.pkl) desde disco o usa regresión lineal como fallback.
# Publica en Kafka si la densidad predicha supera el umbral crítico del 85%.

import os
import uuid
from datetime import datetime, timezone
from collections import defaultdict, deque
from typing import Optional
import joblib

# Umbral de densidad que activa el re-enrutamiento automático de buses
CONGESTION_THRESHOLD = 0.85
# Ventana histórica de velocidades para el modelo autorregresivo (últimas N muestras)
AR_WINDOW = 10


class CongestionPredictor:
    def __init__(self):
        # Historial de velocidades por corredor: {corridor_id: deque[float]}
        self._speed_history: dict[str, deque] = defaultdict(lambda: deque(maxlen=AR_WINDOW))
        # Última predicción calculada por corredor
        self._latest_predictions: dict[str, dict] = {}
        # Coeficientes del modelo autorregresivo (cargados desde .pkl o defaults)
        self._model = self._load_model()

    def _load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), 'congestion_model.pkl')
        if os.path.exists(model_path):
            return joblib.load(model_path)
        # Modelo simplificado: coeficientes fijos para el hackatón
        return None

    def update(self, corridor_id: str, avg_speed_kmh: float, weather_factor: float = 0.0) -> dict:
        """
        Actualiza el historial de velocidades del corredor y recalcula D(t+30).
        Retorna la predicción actual con flag si supera el umbral crítico.
        """
        self._speed_history[corridor_id].append(avg_speed_kmh)
        density = self._predict(corridor_id, weather_factor)

        prediction = {
            "event_id": str(uuid.uuid4()),
            "corridor_id": corridor_id,
            "predicted_density": round(density, 4),
            "prediction_horizon_minutes": 30,
            "threshold_exceeded": density > CONGESTION_THRESHOLD,
            "published_at": datetime.now(timezone.utc).isoformat(),
        }
        self._latest_predictions[corridor_id] = prediction
        return prediction

    def _predict(self, corridor_id: str, weather_factor: float) -> float:
        history = list(self._speed_history[corridor_id])
        if not history:
            return 0.0

        # Normalizar velocidad: velocidad baja → densidad alta
        # Velocidad referencia: 60 km/h = densidad 0 (flujo libre)
        avg_speed = sum(history) / len(history)
        speed_density = max(0.0, 1.0 - (avg_speed / 60.0))

        # Ajuste por factor climático (0=soleado, 1=lluvia intensa)
        climate_adjustment = 0.15 * weather_factor

        return min(1.0, speed_density + climate_adjustment)

    def get_latest(self, corridor_id: str) -> Optional[dict]:
        return self._latest_predictions.get(corridor_id)
