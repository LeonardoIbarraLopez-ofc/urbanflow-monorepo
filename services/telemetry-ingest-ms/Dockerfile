# Dockerfile — Imagen Docker para telemetry-ingest-ms (Go).
# Multi-stage build: compila el binario en la imagen builder y lo copia a imagen mínima alpine.
# Expone puerto 8080 (HTTP) y 9001/udp (telemetría GPS directa).

FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copiar módulos primero para aprovechar caché de capas Docker
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compilar binario estático sin dependencias externas
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/main.go

# --- Imagen de producción mínima ---
FROM alpine:3.19

WORKDIR /app

# Certificados TLS necesarios para conectarse a Upstash Kafka sobre SSL
RUN apk --no-cache add ca-certificates

COPY --from=builder /app/server .

EXPOSE 8080
EXPOSE 9001/udp

CMD ["./server"]
