<?php

use App\Models\WorkforceNotification;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('notifications:prune {--days=30 : The number of days to retain read notifications}', function () {
    $days = (int) $this->option('days');
    $count = WorkforceNotification::query()
        ->whereNotNull('read_at')
        ->where('read_at', '<', now()->subDays($days))
        ->delete();

    $this->info("Pruned {$count} read notification(s) older than {$days} days.");
})->purpose('Prune read notifications older than a given number of days');

Schedule::command('notifications:prune')->daily();
