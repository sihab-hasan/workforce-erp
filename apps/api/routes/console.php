<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

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

Artisan::command('workforce:create-admin {--name=Admin} {--email=} {--password=}', function () {
    $email = strtolower(trim((string) $this->option('email')));
    $password = (string) $this->option('password');
    $name = (string) $this->option('name');

    if ($email === '' || $password === '') {
        $this->error('Both --email and --password are required.');
        return 1;
    }

    $user = \App\Models\User::query()->firstOrNew(['email' => $email]);
    $user->forceFill([
        'name' => $name,
        'password' => \Illuminate\Support\Facades\Hash::make($password),
        'email_verified_at' => now(),
        'password_initialized_at' => now(),
        'status' => 'active',
        'locked_at' => null,
    ])->save();

    $user->platformRoleAssignments()->updateOrCreate(
        ['role' => 'platform_super_admin'],
        ['reason' => 'Provisioned via workforce:create-admin CLI']
    );

    // Also link to default organization if exists
    $org = \App\Models\Organization::first();
    if ($org) {
        $membership = $user->memberships()->where('organization_id', $org->id)->first();
        if (! $membership) {
            $user->organizations()->attach($org->id, [
                'role' => 'owner',
                'status' => 'active',
                'data_scope' => 'ORGANIZATION',
                'activated_at' => now(),
            ]);
            $membership = $user->memberships()->where('organization_id', $org->id)->first();
        }
        $ownerRole = \App\Models\Role::query()->where('organization_id', $org->id)->where('name', 'organization_owner')->first();
        if ($ownerRole && $membership) {
            $membership->roleAssignments()->updateOrCreate(
                ['role_id' => $ownerRole->id],
                ['scope' => 'ORGANIZATION', 'assigned_by' => $user->id, 'reason' => 'Admin CLI provisioning']
            );
        }
    }

    $this->info("Platform Super Admin successfully created/updated: {$email}");
    return 0;
})->purpose('Create or reset a platform super admin user');
