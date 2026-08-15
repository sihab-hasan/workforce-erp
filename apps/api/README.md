# Workforce ERP API Backend

This is the canonical Laravel API backend service for Workforce ERP. It is an API-only Laravel service that exposes RESTful JSON resources for the administrative, portal, and web frontends.

---

## Features

- Laravel 10 backend API namespace
- Unified API Response format (using `ApiResponseTrait`)
- Global exception mapping to standard JSON response contract
- Versioned API routes under `/api/v1`
- SQLite/MySQL clean setup support
- Integrated developer tests (PHPUnit) and code-style formatting (Laravel Pint)

---

## Installation & Setup

1. **Install Dependencies**

   ```bash
   composer install
   ```

2. **Configure Environment**
   Copy the example environment configuration:

   ```bash
   cp .env.example .env
   ```

   Generate the application key:

   ```bash
   php artisan key:generate
   ```

3. **Database Migration**
   Run the migrations to create the database schema:
   ```bash
   php artisan migrate:fresh
   ```

---

## Validation & Testing

Run the automated test suite:

```bash
php artisan test
```

Verify code-style formatting (Laravel Pint):

```bash
composer exec pint -- --test
```

To auto-format PHP files:

```bash
composer exec pint
```
