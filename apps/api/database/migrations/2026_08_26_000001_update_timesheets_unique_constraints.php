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
        Schema::table('timesheets', function (Blueprint $table) {
            // Drop legacy single-session-per-day constraint to support multiple non-overlapping shifts per day
            $table->dropUnique(['employee_id', 'date']);

            // Add indexing for rapid overlap and date interval queries
            $table->index(['employee_id', 'date']);
            $table->index(['employee_id', 'clock_in']);
            $table->index(['employee_id', 'clock_out']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timesheets', function (Blueprint $table) {
            $table->dropIndex(['employee_id', 'clock_out']);
            $table->dropIndex(['employee_id', 'clock_in']);
            $table->dropIndex(['employee_id', 'date']);

            $table->unique(['employee_id', 'date']);
        });
    }
};
