FROM node:24-alpine AS builder
RUN apk update && apk upgrade --no-cache
WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_API_BASE_URL=http://backend:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
