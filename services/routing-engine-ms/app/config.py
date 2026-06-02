# config.py — Configuración de conexión a Neo4j AuraDB para routing-engine-ms.
# Lee las credenciales desde variables de entorno; falla rápido si faltan.

import os
from dataclasses import dataclass


@dataclass
class Settings:
    neo4j_uri: str
    neo4j_username: str
    neo4j_password: str
    # Pesos del algoritmo de costo multiobjetivo W = α·T + β·C + γ·E
    # Configurables para perfiles de usuario: Rápida, Barata, Ecológica
    alpha: float  # Peso para tiempo estimado (Tᵉˢᵗ)
    beta: float   # Peso para costo monetario (Cₘₒₙ)
    gamma: float  # Peso para emisiones CO2 (ECO₂)


def get_settings() -> Settings:
    return Settings(
        neo4j_uri=_require("NEO4J_URI"),
        neo4j_username=_require("NEO4J_USERNAME"),
        neo4j_password=_require("NEO4J_PASSWORD"),
        alpha=float(os.getenv("ROUTE_ALPHA", "0.5")),
        beta=float(os.getenv("ROUTE_BETA", "0.3")),
        gamma=float(os.getenv("ROUTE_GAMMA", "0.2")),
    )


def _require(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise EnvironmentError(f"Variable de entorno requerida no definida: {key}")
    return value
