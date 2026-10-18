FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_LANDING_SITE_URL
RUN for name in VITE_API_BASE_URL VITE_LANDING_SITE_URL; do \
      if [ -z "$(printenv $name)" ]; then \
        echo "$name build argument is required" >&2; \
        exit 1; \
      fi; \
    done
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_LANDING_SITE_URL=${VITE_LANDING_SITE_URL}

RUN pnpm build

FROM nginx:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
