FROM node:20-alpine AS build

WORKDIR /app

ARG API_URL
ARG KEYCLOAK_URL
ARG KEYCLOAK_REALM
ARG KEYCLOAK_CLIENT_ID

COPY package*.json ./
RUN npm ci

COPY . .

RUN echo "export const environment = { \
  production: true, \
  apiUrl: '${API_URL}', \
  keycloak: { \
    url: '${KEYCLOAK_URL}', \
    realm: '${KEYCLOAK_REALM}', \
    clientId: '${KEYCLOAK_CLIENT_ID}' \
  } \
};" > src/environments/environment.ts

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
