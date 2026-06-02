# routes.py — Endpoints HTTP del motor de rutas multimodales.
# POST /v1/routes/calculate — Recibe origen/destino y preferencia del usuario,
# ejecuta el algoritmo A* sobre el grafo Neo4j y retorna las alternativas de ruta
# ordenadas por costo combinado W = α·T + β·C + γ·E.

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Literal

from app.core.algorithms import RouteAlgorithm

router = APIRouter()


class RouteRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    destination_lat: float
    destination_lon: float
    # Perfil de preferencia del usuario; afecta los pesos α, β, γ del algoritmo
    preference: Literal["fastest", "cheapest", "eco"] = "fastest"


class RouteLeg(BaseModel):
    mode: str           # "BUS" | "METRO" | "SCOOTER" | "WALK"
    from_stop: str
    to_stop: str
    duration_minutes: float
    cost_usd: float
    co2_grams: float


class RouteResponse(BaseModel):
    route_id: str
    total_duration_minutes: float
    total_cost_usd: float
    total_co2_grams: float
    weighted_score: float   # W = α·T + β·C + γ·E (menor = mejor)
    legs: list[RouteLeg]


@router.post("/calculate", response_model=list[RouteResponse])
async def calculate_routes(request: Request, body: RouteRequest):
    """
    Calcula hasta 3 alternativas de ruta multimodal entre origen y destino.
    Combina modos: Bus, Metro, Scooter y Caminata.
    Retorna las rutas ordenadas por puntaje ponderado (menor es mejor).
    """
    neo4j = request.app.state.neo4j
    algorithm = RouteAlgorithm(neo4j)

    try:
        routes = await algorithm.calculate(
            origin=(body.origin_lat, body.origin_lon),
            destination=(body.destination_lat, body.destination_lon),
            preference=body.preference,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculando ruta: {str(e)}")

    if not routes:
        raise HTTPException(status_code=404, detail="No se encontraron rutas disponibles")

    return routes
