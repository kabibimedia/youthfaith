<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE live_sessions MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'live'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE live_sessions MODIFY COLUMN status ENUM('live', 'ended') NOT NULL DEFAULT 'live'");
    }
};
