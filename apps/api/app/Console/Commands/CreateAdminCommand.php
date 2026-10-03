<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create
                            {--email= : The email address of the platform admin}
                            {--password= : The password for the admin}
                            {--name= : The full name of the admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update a Platform Super Admin user account';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->option('email') ?: config('workforce.local_bootstrap.owner_email') ?: 'admin@workforce.local';
        $password = $this->option('password') ?: config('workforce.local_bootstrap.owner_password') ?: 'password@1234';
        $name = $this->option('name') ?: config('workforce.local_bootstrap.owner_name') ?: 'Platform Admin';

        $email = Str::lower(trim((string) $email));

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => (string) $name,
            'password' => Hash::make((string) $password),
            'email_verified_at' => now(),
            'password_initialized_at' => now(),
            'status' => 'active',
            'locked_at' => null,
        ])->save();

        $user->platformRoleAssignments()->updateOrCreate(
            ['role' => 'platform_super_admin'],
            ['reason' => 'Created via admin:create command']
        );

        $this->info("--------------------------------------------------");
        $this->info("Platform Super Admin successfully configured!");
        $this->info("Email:    {$email}");
        $this->info("Password: {$password}");
        $this->info("Role:     platform_super_admin");
        $this->info("--------------------------------------------------");

        return Command::SUCCESS;
    }
}
