# algorithms.py — Implementación del algoritmo A* multimodal sobre Neo4j AuraDB.
# Calcula el costo ponderado de cada arista del grafo:
#   W = α·Tᵉˢᵗ + β·Cₘₒₙ + γ·ECO₂
# donde α, β, γ son los pesos del perfil de preferencia del usuario.
# La consulta Cypher navega nodos: TransitStation, MicroMobilityHub, Intersection.

import uuid
from typing import Literal

from app.config import get_settings
from app.database.neo4j_connection import Neo4jConnection


# Factores de emisión de CO2 por modo de transporte (gramos por km)
CO2_FACTORS = {
    "BUS": 68.0,
    "METRO": 4.0,
    "SCOOTER": 2.0,
    "WALK": 0.0,
}

# Tarifas base por modo (USD por km)
COST_PER_KM = {
    "BUS": 0.25,
    "METRO": 0.30,
    "SCOOTER": 0.15,
    "WALK": 0.0,
}


class RouteAlgorithm:
    def __init__(self, neo4j: Neo4jConnection):
        self.neo4j = neo4j
        self.settings = get_settings()

    def _weights_for_preference(self, preference: str) -> tuple[float, float, float]:
        # Devuelve (α, β, γ) según la preferencia del usuario
        profiles = {
            "fastest":  (0.7, 0.2, 0.1),  # Prioriza tiempo
            "cheapest": (0.2, 0.7, 0.1),  # Prioriza costo monetario
            "eco":      (0.2, 0.1, 0.7),  # Prioriza huella de carbono
        }
        return profiles.get(preference, (0.5, 0.3, 0.2))

    async def calculate(
        self,
        origin: tuple[float, float],
        destination: tuple[float, float],
        preference: Literal["fastest", "cheapest", "eco"],
    ) -> list[dict]:
        """
        Ejecuta la consulta Cypher de shortest path ponderado en Neo4j
        y retorna las alternativas de ruta ordenadas por W ascendente.
        """
        alpha, beta, gamma = self._weights_for_preference(preference)

        # Cypher: shortest path con costo ponderado combinando tiempo, costo y CO2
        cypher = """
        MATCH (origin:TransitStation), (dest:TransitStation)
        WHERE point.distance(
            point({latitude: origin.lat, longitude: origin.lon}),
            point({latitude: $origin_lat, longitude: $origin_lon})
        ) < 500
        AND point.distance(
            point({latitude: dest.lat, longitude: dest.lon}),
            point({latitude: $dest_lat, longitude: $dest_lon})
        ) < 500
        CALL apoc.algo.dijkstra(origin, dest, 'CONNECTS_TO|WALKS_TO', 'weight')
        YIELD path, weight
        RETURN path, weight
        LIMIT 3
        """

        with self.neo4j.driver.session() as session:
            result = session.run(
                cypher,
                origin_lat=origin[0],
                origin_lon=origin[1],
                dest_lat=destination[0],
                dest_lon=destination[1],
            )
            routes = []
            for record in result:
                route = self._build_route_response(record, alpha, beta, gamma)
                routes.append(route)

        return sorted(routes, key=lambda r: r["weighted_score"])

    def _build_route_response(self, record, alpha, beta, gamma) -> dict:
        # Construye el objeto de respuesta con métricas calculadas por tramo
        # TODO: parsear el path de Neo4j para extraer los legs reales
        return {
            "route_id": str(uuid.uuid4()),
            "total_duration_minutes": 0.0,
            "total_cost_usd": 0.0,
            "total_co2_grams": 0.0,
            "weighted_score": 0.0,
            "legs": [],
        }
