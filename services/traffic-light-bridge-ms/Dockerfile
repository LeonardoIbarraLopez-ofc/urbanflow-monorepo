# Dockerfile — Imagen Docker para traffic-light-bridge-ms (TypeScript/Node.js).
# Compila TypeScript y ejecuta el consumer Kafka que emite tramas NTCIP binarias UDP.

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Imagen de producción ---
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# No expone puerto HTTP; es un consumer Kafka + emisor UDP
CMD ["node", "dist/index.js"]
