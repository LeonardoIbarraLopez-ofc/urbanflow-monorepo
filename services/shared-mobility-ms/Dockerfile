# Dockerfile — Imagen Docker para shared-mobility-ms (Node/TypeScript).
# Gestión de micro-movilidad con MongoDB Atlas y bloqueos Redis.

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
