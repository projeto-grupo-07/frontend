# Stage 1 — build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm config set fetch-retry-maxtimeout 600000 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retries 5 \
 && npm ci --prefer-offline --no-audit --progress=false

COPY . .

RUN npm run build

# Stage 2 — nginx
FROM nginx:alpine

# remove config padrão
RUN rm -rf /etc/nginx/conf.d/default.conf

# adiciona config custom (SPA fix)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Vite gera /dist
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]