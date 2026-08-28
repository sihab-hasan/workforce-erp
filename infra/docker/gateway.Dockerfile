FROM nginx:1.27-alpine

COPY infra/nginx/gateway-http.conf.template /opt/workforce/nginx/gateway-http.conf.template
COPY infra/nginx/gateway-tls.conf.template /opt/workforce/nginx/gateway-tls.conf.template
COPY infra/nginx/snippets /etc/nginx/snippets
COPY infra/docker/scripts/gateway-select-config.sh /docker-entrypoint.d/10-workforce-select-config.sh
COPY infra/docker/scripts/gateway-cert-reload.sh /docker-entrypoint.d/30-workforce-cert-reload.sh

RUN chmod +x \
      /docker-entrypoint.d/10-workforce-select-config.sh \
      /docker-entrypoint.d/30-workforce-cert-reload.sh

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/healthz | grep -q '^ok$' || exit 1
