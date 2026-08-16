<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class RouteServiceProvider extends ServiceProvider
{
    public const HOME = '/home';

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(10)->by($this->emailAndIpKey($request));
        });

        RateLimiter::for('otp-request', function (Request $request) {
            return Limit::perMinute(5)->by($this->emailAndIpKey($request));
        });

        RateLimiter::for('otp-verify', function (Request $request) {
            return Limit::perMinute(10)->by($this->emailAndIpKey($request));
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(5)->by($this->emailAndIpKey($request));
        });

        RateLimiter::for('password-change', function (Request $request) {
            return Limit::perMinute(5)->by(($request->user()?->id ?: 'guest').'|'.$request->ip());
        });

        RateLimiter::for('sso', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        RateLimiter::for('service', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        $this->routes(function () {
            // Keep liveness independent from sessions, auth, throttling and the database.
            // This route is intentionally outside the `api` middleware group so a broken
            // session/database dependency cannot leave health checks hanging forever.
            Route::get('/api/health', static function () {
                return new \Illuminate\Http\JsonResponse([
                    'status' => 'ok',
                    'service' => 'workforce-erp-api',
                ]);
            });

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    private function emailAndIpKey(Request $request): string
    {
        return Str::lower(trim((string) $request->input('email'))).'|'.$request->ip();
    }
}
