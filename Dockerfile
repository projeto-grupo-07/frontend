
# Aplicação frontend
from node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Nginx para servir a aplicação
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
expose 80
CMD ["nginx", "-g", "daemon off;"]