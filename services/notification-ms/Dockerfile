# Dockerfile — Imagen Docker para notification-ms (Node/TypeScript).
# Expone puerto 3000 para WebSocket (ws://) y SSE HTTP (/events).

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
