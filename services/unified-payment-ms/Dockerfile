# Dockerfile — Imagen Docker para unified-payment-ms (NestJS/TypeScript).
# Multi-stage: compila TypeScript a JavaScript y copia solo el dist al contenedor final.

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

EXPOSE 3000

CMD ["node", "dist/main"]
