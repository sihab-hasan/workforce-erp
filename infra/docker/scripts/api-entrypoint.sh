#!/bin/sh
set -eu

case "${APP_KEY:-}" in
  ''|__GENERATE_APP_KEY__)
    echo >&2 "ERROR: APP_KEY is not initialized. Run: bash scripts/docker-setup.sh"
    exit 1
    ;;
esac

mkdir -p \
  storage/app \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

# Never boot Laravel with cache files copied from a development environment.
rm -f bootstrap/cache/*.php

# Package discovery and config clearing
php artisan config:clear >/dev/null
php artisan package:discover --ansi >/dev/null

# Automated TCP wait for MySQL and Redis readiness using the PHP CLI
if [ -n "${DB_HOST:-}" ]; then
  echo "Waiting for MySQL (${DB_HOST}:${DB_PORT:-3306}) to be ready..."
  php -r '
    $host = getenv("DB_HOST");
    $port = getenv("DB_PORT") ?: "3306";
    $db   = getenv("DB_DATABASE");
    $user = getenv("DB_USERNAME");
    $pass = getenv("DB_PASSWORD");
    $dsn  = "mysql:host=$host;port=$port;dbname=$db";
    for ($i = 0; $i < 30; $i++) {
        try {
            $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_TIMEOUT => 2]);
            exit(0);
        } catch (PDOException $e) {
            sleep(1);
        }
    }
    echo "ERROR: MySQL connection timed out\n";
    exit(1);
  '
fi

if [ -n "${REDIS_HOST:-}" ]; then
  echo "Waiting for Redis (${REDIS_HOST}:${REDIS_PORT:-6379}) to be ready..."
  php -r '
    $host = getenv("REDIS_HOST");
    $port = getenv("REDIS_PORT") ?: "6379";
    $pass = getenv("REDIS_PASSWORD");
    for ($i = 0; $i < 30; $i++) {
        try {
            $redis = new Redis();
            if (@$redis->connect($host, (int)$port, 2.0)) {
                if ($pass && !@$redis->auth($pass)) {
                    // Password failed
                }
                if (@$redis->ping()) {
                    exit(0);
                }
            }
        } catch (Exception $e) {}
        sleep(1);
    }
    echo "ERROR: Redis connection timed out\n";
    exit(1);
  '
fi

# Caching for production
if [ "${APP_ENV:-production}" = "production" ]; then
  php artisan config:cache >/dev/null
  php artisan route:cache >/dev/null
  if [ -d resources/views ]; then
    php artisan view:cache >/dev/null
  fi
fi

# Role-based startup via CONTAINER_ROLE
ROLE="${CONTAINER_ROLE:-app}"

if [ "$ROLE" = "queue" ]; then
  echo "Starting queue worker..."
  exec php artisan queue:work redis --sleep=3 --tries=3 --timeout=90 --max-time=3600
elif [ "$ROLE" = "scheduler" ]; then
  echo "Starting scheduler..."
  exec php artisan schedule:work
else
  echo "Starting FPM application..."
  exec "$@"
fi
