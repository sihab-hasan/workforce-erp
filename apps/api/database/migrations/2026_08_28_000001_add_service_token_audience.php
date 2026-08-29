<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('service_access_tokens', 'audience')) {
            Schema::table('service_access_tokens', function (Blueprint $table): void {
                $table->string('audience', 64)->default('workforce-api')->after('token_hash')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('service_access_tokens', 'audience')) {
            Schema::table('service_access_tokens', function (Blueprint $table): void {
                $table->dropIndex(['audience']);
                $table->dropColumn('audience');
            });
        }
    }
};
