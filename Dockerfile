# LanguageApp Web - multi-stage Dockerfile for on-premises (nginx static hosting).
#
# NOTE: Vite inlines VITE_* values at BUILD time, so the resulting image is environment-specific.
#       Pass the backend URLs as build args (the docker-compose build / GitHub Actions workflow do this):
#
#   docker build \
#     --build-arg VITE_API_IDENTITY_URL=https://identity.example.com \
#     --build-arg VITE_API_ENGLISH_URL=https://english.example.com \
#     --build-arg VITE_API_DEUTSCH_URL=https://deutsch.example.com \
#     --build-arg VITE_API_CHAT_PRACTICE_URL=https://english.example.com \
#     -t <dockerhub-user>/languageapp-web:latest .
#
# For Azure the Web app is deployed as an Azure Static Web App (see .github/workflows/azure-static-web-apps.yml),
# not as this container image.

# --- Build (compile the Vite SPA into static assets) ---
FROM node:20-alpine AS build
WORKDIR /app

# Build-time API endpoints (inlined into the bundle by Vite).
ARG VITE_API_IDENTITY_URL=http://localhost:8000
ARG VITE_API_ENGLISH_URL=http://localhost:8010
ARG VITE_API_DEUTSCH_URL=http://localhost:8006
ARG VITE_API_CHAT_PRACTICE_URL=http://localhost:8010
ARG VITE_API_PHRASAL_VERBS_URL=http://localhost:8010
ARG VITE_API_PREPOSITIONS_URL=http://localhost:8010
ENV VITE_API_IDENTITY_URL=$VITE_API_IDENTITY_URL \
    VITE_API_ENGLISH_URL=$VITE_API_ENGLISH_URL \
    VITE_API_DEUTSCH_URL=$VITE_API_DEUTSCH_URL \
    VITE_API_CHAT_PRACTICE_URL=$VITE_API_CHAT_PRACTICE_URL \
    VITE_API_PHRASAL_VERBS_URL=$VITE_API_PHRASAL_VERBS_URL \
    VITE_API_PREPOSITIONS_URL=$VITE_API_PREPOSITIONS_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production (serve static files via nginx with SPA fallback) ---
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
