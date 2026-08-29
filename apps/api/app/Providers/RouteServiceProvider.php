<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class RouteServiceProvider extends ServiceProvider
{
    public const HOME = '/';

    public function boot(): void
    {
        $definitions = ['login' => 10, 'registration' => 5, 'registration-resend' => 3, 'forgot-password' => 5, 'password-reset' => 5, 'password-change' => 5, 'mfa-verify' => 10, 'mfa-send-email' => 5, 'mfa-send-sms' => 5, 'phone-verification' => 5, 'email-change' => 5, 'phone-change' => 5, 'invitation-acceptance' => 10, 'sso' => 20, 'access-request' => 10, 'service-token' => 10, 'service' => 60];
        foreach ($definitions as $name => $limit) {
            RateLimiter::for($name, fn (Request $r) => Limit::perMinute($limit)->by($this->identityKey($r)));
        } RateLimiter::for('api', fn (Request $r) => Limit::perMinute(60)->by($r->user()?->id ?: $r->ip()));
        $this->routes(function () {
            Route::get('/api/health', static fn () => new JsonResponse(['status' => 'ok', 'service' => 'workforce-erp-api']));
            Route::middleware('api')->prefix('api')->group(base_path('routes/api.php'));
            Route::middleware('web')->group(base_path('routes/web.php'));
        });
    }

    private function identityKey(Request $r): string
    {
        return Str::lower(trim((string) $r->input('email', $r->user()?->email ?? ''))).'|'.$r->ip();
    }
}
