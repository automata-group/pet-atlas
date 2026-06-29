# Multi-stage build for NestJS Backend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
# Create uploads directory and ensure it has open permissions or correct ownership
RUN mkdir -p uploads && chmod 777 uploads

EXPOSE 3000
CMD ["node", "dist/main"]
