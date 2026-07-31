# Etapa de compilación
FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_PAYPAL_CLIENT_ID
ENV VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Etapa de producción
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]