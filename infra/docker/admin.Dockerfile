FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile
ARG VITE_API_BASE_URL
ARG VITE_API_URL
ARG VITE_WEB_URL
ARG VITE_ERP_URL
ARG VITE_ADMIN_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_URL=$VITE_API_URL \
    VITE_WEB_URL=$VITE_WEB_URL \
    VITE_ERP_URL=$VITE_ERP_URL \
    VITE_ADMIN_URL=$VITE_ADMIN_URL
RUN pnpm nx build @workforce-erp/admin

FROM nginx:1.27-alpine
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/healthz | grep -q '^ok$' || exit 1
