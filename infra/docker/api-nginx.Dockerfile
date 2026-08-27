FROM nginx:1.27-alpine

COPY infra/nginx/api.conf /etc/nginx/conf.d/default.conf
COPY apps/api/public /var/www/html/public

RUN mkdir -p /var/www/html/storage/app/public \
    && ln -sfn ../storage/app/public /var/www/html/public/storage

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/healthz | grep -q '^ok$' || exit 1
