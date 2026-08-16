<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local') || ! config('workforce.local_bootstrap.enabled', true)) {
            return;
        }

        $settings = config('workforce.local_bootstrap');
        $email = Str::lower(trim((string) ($settings['owner_email'] ?? '')));
        $password = (string) ($settings['owner_password'] ?? '');

        if ($email === '' || $password === '') {
            $this->command?->warn('Local bootstrap owner skipped: email/password is empty.');
            return;
        }

        $organization = Organization::query()->firstOrCreate(
            ['slug' => (string) $settings['organization_slug']],
            ['name' => (string) $settings['organization_name']]
        );

        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => (string) $settings['owner_name'],
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        $membership = $user->memberships()
            ->where('organization_id', $organization->id)
            ->first();

        if ($membership) {
            $membership->update(['role' => 'owner', 'status' => 'active']);
        } else {
            $user->organizations()->attach($organization->id, [
                'role' => 'owner',
                'status' => 'active',
            ]);
        }

        $nameParts = preg_split('/\s+/', trim((string) $settings['owner_name']), 2) ?: [];
        $firstName = $nameParts[0] ?? 'Local';
        $lastName = $nameParts[1] ?? 'Owner';

        Employee::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => $email,
            ],
            [
                'user_id' => $user->id,
                'employee_id' => 'LOCAL-OWNER',
                'first_name' => $firstName,
                'last_name' => $lastName,
                'hire_date' => now()->toDateString(),
                'status' => 'active',
                'employment_type' => 'full-time',
            ]
        );

        $this->command?->info("Local Workforce owner ready: {$email}");
    }
}
