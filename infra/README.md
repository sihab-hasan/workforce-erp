# Infrastructure & Deployment

This directory contains the containerization and web server infrastructure for both local development and live production hosting.

## 1. Production VPS Architecture (Live)

The live production system is hosted on an Ubuntu Linux VPS (`187.52.122.100`) at [http://workforce.austattendance.online](http://workforce.austattendance.online).

### Architecture Components

- **Reverse Proxy:** Host Nginx (`/etc/nginx/sites-available/workforce.austattendance.online`) listening on port 80.
- **PHP Runtime:** PHP 8.4-FPM communicating over a dedicated unix domain socket (`/run/php/php8.4-fpm-s20230204060.sock`).
- **Database:** MySQL 8.4 running in shared container `cse3100-db` on the VPS host with database `workforce_db`.
- **Static Frontend:** Multi-SPA static files served from `/home/s20230204060/laravel/public` (`/`, `/erp/`, `/admin/`, `/app/`).
- **CI/CD Automation:** GitHub Actions (`.github/workflows/deploy.yml`) builds frontend & backend artifacts on GitHub, transfers via SCP, unpacks into `~/laravel`, executes `php artisan migrate --force`, and refreshes Laravel optimization caches.

### Host Nginx VirtualHost (`/etc/nginx/sites-available/workforce.austattendance.online`)

```nginx
server {
    listen 80;
    server_name workforce.austattendance.online;
    root /home/s20230204060/laravel/public;
    index index.html index.php;

    access_log /var/log/nginx/s20230204060-access.log;
    error_log  /var/log/nginx/s20230204060-error.log;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm-s20230204060.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

---

## 2. Local Docker Desktop Stack

The local Compose stack uses Nginx (`infra/docker/nginx.conf`), PHP 8.5/Apache for Laravel, MySQL 8.4, and Redis 7.4.

### Start

Copy the example environment and set a valid Laravel `APP_KEY` before building:

```bash
cp .env.docker.example .env.docker
docker run --rm php:8.5-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Paste the generated key into `.env.docker`, then start the containers:

```bash
pnpm docker:build
```

Local URLs (single origin, same-origin API proxying):

- Web: `http://localhost:8080`
- ERP: `http://localhost:8080/erp/`
- Admin: `http://localhost:8080/admin/`
- API: `http://localhost:8080/api`

### Gmail SMTP

Set `MAIL_USERNAME` and `MAIL_FROM_ADDRESS` to the Google account address, and `MAIL_PASSWORD` to a Google App Password. App Passwords require 2-Step Verification; do not use your normal Google account password. Keep the App Password only in the ignored `.env.docker` file.

Stop the stack with `pnpm docker:down`. This removes containers and the network but preserves named MySQL, Redis, and upload volumes. Do not add `-v` unless intentionally deleting local data.
