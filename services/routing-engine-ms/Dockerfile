# Dockerfile — Imagen Docker para routing-engine-ms (Python/FastAPI).
# Expone el servidor Uvicorn en puerto 8000.

FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias antes de copiar el código (mejor caché de capas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Uvicorn con recarga automática en dev; en prod quitar --reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
