<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_sessions', function (Blueprint $table) {
            $table->unsignedInteger('viewer_count')->default(0)->after('status');
            $table->unsignedInteger('heart_count')->default(0)->after('viewer_count');
        });
    }

    public function down(): void
    {
        Schema::table('live_sessions', function (Blueprint $table) {
            $table->dropColumn(['viewer_count', 'heart_count']);
        });
    }
};
