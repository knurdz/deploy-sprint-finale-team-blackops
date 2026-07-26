FROM node:20-alpine AS build
WORKDIR /app

# Lockfile-only copy first so npm ci uses exactly what's committed and
# stays cacheable independent of source changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# No .git in this build context, so generate-status.mjs falls back to
# GITHUB_SHA for the commit it stamps into /status and /api/*.
ARG GIT_SHA=unknown
ENV GITHUB_SHA=$GIT_SHA
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80
