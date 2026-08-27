<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('legal_name')->nullable()->after('name');
            $table->string('email')->nullable()->after('subdomain');
            $table->string('phone', 50)->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->string('timezone', 64)->default('UTC')->after('address');
            $table->string('locale', 16)->default('en')->after('timezone');
            $table->json('settings')->nullable()->after('locale');
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->string('email')->nullable()->after('address');
            $table->string('phone', 50)->nullable()->after('email');
            $table->string('timezone', 64)->nullable()->after('phone');
            $table->json('settings')->nullable()->after('timezone');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->string('gender', 32)->nullable()->after('date_of_birth');
            $table->text('address')->nullable()->after('gender');
            $table->string('emergency_contact_name')->nullable()->after('address');
            $table->string('emergency_contact_phone', 50)->nullable()->after('emergency_contact_name');
            $table->text('notes')->nullable()->after('emergency_contact_phone');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['date_of_birth', 'gender', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'notes']);
        });
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn(['email', 'phone', 'timezone', 'settings']);
        });
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['legal_name', 'email', 'phone', 'address', 'timezone', 'locale', 'settings']);
        });
    }
};
