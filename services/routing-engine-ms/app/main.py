# main.py — Punto de entrada de routing-engine-ms (FastAPI).
# Inicializa la app, conecta a Neo4j AuraDB y registra los routers.
# Endpoint principal: POST /v1/routes/calculate

from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.api.routes import router as routes_router
from app.database.neo4j_connection import Neo4jConnection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Establecer conexión al grafo multimodal en Neo4j AuraDB al arrancar
    app.state.neo4j = Neo4jConnection()
    app.state.neo4j.connect()
    yield
    # Cerrar driver de Neo4j limpiamente al detener el servicio
    app.state.neo4j.close()


app = FastAPI(
    title="UrbanFlow Routing Engine",
    description="Motor de cálculo de rutas multimodales A* sobre grafo Neo4j. Combina Bus + Metro + Scooter + Caminata optimizando tiempo, costo y huella de CO2.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(routes_router, prefix="/v1/routes")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "routing-engine-ms"}
