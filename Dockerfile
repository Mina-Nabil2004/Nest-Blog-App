# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/main"]
