# syntax=docker/dockerfile:1.7
FROM composer:2 AS composer-bin

FROM php:8.5-fpm-alpine AS runtime

WORKDIR /var/www/html

RUN apk add --no-cache \
      bash \
      curl \
      icu-libs \
      libzip \
      libpng \
      libjpeg-turbo \
      freetype \
      fcgi \
    && apk add --no-cache --virtual .build-deps \
      $PHPIZE_DEPS \
      icu-dev \
      libzip-dev \
      linux-headers \
      libpng-dev \
      libjpeg-turbo-dev \
      freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
      bcmath \
      intl \
      pcntl \
      pdo_mysql \
      zip \
      gd \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /tmp/pear

COPY --from=composer-bin /usr/bin/composer /usr/local/bin/composer
COPY infra/docker/php-production.ini /usr/local/etc/php/conf.d/99-workforce.ini
COPY infra/docker/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY infra/docker/scripts/api-entrypoint.sh /usr/local/bin/workforce-api-entrypoint

COPY apps/api/composer.json apps/api/composer.lock ./
RUN composer install \
      --no-dev \
      --no-interaction \
      --no-progress \
      --prefer-dist \
      --optimize-autoloader \
      --no-scripts

COPY apps/api ./
RUN composer dump-autoload \
      --no-dev \
      --classmap-authoritative \
      --no-interaction \
      --no-scripts \
    && mkdir -p \
      storage/app \
      storage/framework/cache/data \
      storage/framework/sessions \
      storage/framework/views \
      storage/logs \
      bootstrap/cache \
    && rm -f bootstrap/cache/*.php \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x /usr/local/bin/workforce-api-entrypoint

USER www-data

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/workforce-api-entrypoint"]
CMD ["php-fpm", "-F"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD SCRIPT_NAME=/ping SCRIPT_FILENAME=/ping REQUEST_METHOD=GET cgi-fcgi -bind -connect 127.0.0.1:9000 | grep -q "pong" || exit 1
