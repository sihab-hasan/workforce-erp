<?php

namespace App\Providers;

use App\Contracts\SmsProviderInterface;
use App\Services\Sms\HttpSmsProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(SmsProviderInterface::class, HttpSmsProvider::class);
    }

    public function boot(): void {}
}
