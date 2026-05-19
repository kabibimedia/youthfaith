<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_sessions', function (Blueprint $table) {
            $table->string('stream_key', 32)->nullable()->unique()->after('stream_path');
            $table->string('rtmp_url')->nullable()->after('stream_key');
        });
    }

    public function down(): void
    {
        Schema::table('live_sessions', function (Blueprint $table) {
            $table->dropColumn(['stream_key', 'rtmp_url']);
        });
    }
};
