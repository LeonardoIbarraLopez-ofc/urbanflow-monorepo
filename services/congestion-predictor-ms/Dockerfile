# Dockerfile — Imagen Docker para congestion-predictor-ms (Python/FastAPI/Scikit-Learn).
# Expone API en puerto 8001 y corre el consumer Kafka en thread daemon.

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
