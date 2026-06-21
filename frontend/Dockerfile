# ───────────────────────────────────────────────────────────
# IDEA frontend — multi-stage build
# Stage 1 builds the static bundle; stage 2 serves it with Nginx,
# which also reverse-proxies /api to the backend container.
# ───────────────────────────────────────────────────────────

# ── Build stage ──
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies from the lockfile (reproducible)
COPY package.json package-lock.json ./
RUN npm ci

# Build the production bundle
COPY . .
RUN npm run build

# ── Runtime stage (Nginx) ──
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
