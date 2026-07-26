FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG GIT_SHA=unknown
ENV GITHUB_SHA=$GIT_SHA
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80
