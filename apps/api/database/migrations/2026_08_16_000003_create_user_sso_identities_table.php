<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_sso_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 32);
            $table->string('provider_user_id', 191);
            $table->string('email');
            $table->timestamps();

            $table->unique(['provider', 'provider_user_id']);
            $table->unique(['user_id', 'provider']);
            $table->index('email');
        });

        // Preserve SSO identities created by earlier versions while allowing a
        // Workforce account to link both Google and Microsoft going forward.
        DB::table('users')
            ->whereNotNull('sso_provider')
            ->whereNotNull('sso_provider_id')
            ->orderBy('id')
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    DB::table('user_sso_identities')->updateOrInsert(
                        [
                            'provider' => (string) $user->sso_provider,
                            'provider_user_id' => (string) $user->sso_provider_id,
                        ],
                        [
                            'user_id' => $user->id,
                            'email' => (string) $user->email,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_sso_identities');
    }
};
