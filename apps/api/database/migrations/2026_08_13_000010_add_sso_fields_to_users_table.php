<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('sso_provider')->nullable()->index();
            $table->string('sso_provider_id')->nullable()->index();

            $table->unique(['sso_provider', 'sso_provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['sso_provider', 'sso_provider_id']);
            $table->dropColumn(['sso_provider', 'sso_provider_id']);
        });
    }
};
