FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG GIT_SHA=unknown
ENV GITHUB_SHA=$GIT_SHA
RUN npm run build

FROM node:20-alpine AS build-server
WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/index.mjs ./

FROM nginx:alpine AS runtime

# T20: nodejs runs the OAuth auth server alongside nginx in this same
# container; nginx.conf proxies /auth/ and /status/auth to it and serves
# everything else (including the still-static /health and /status) as
# before. The auth server itself is never EXPOSEd -- only reachable via
# nginx's internal proxy_pass.
RUN apk add --no-cache nodejs

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build-server /app/server /app/server
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint-with-auth.sh /docker-entrypoint-with-auth.sh
RUN chmod +x /docker-entrypoint-with-auth.sh

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint-with-auth.sh"]
