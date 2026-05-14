<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_member')->default(false)->after('location');
            $table->boolean('has_dues_card')->default(false)->after('is_member');
            $table->string('dues_card_code', 5)->unique()->nullable()->after('has_dues_card');
            $table->timestamp('dues_card_issued_at')->nullable()->after('dues_card_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_member', 'has_dues_card', 'dues_card_code', 'dues_card_issued_at']);
        });
    }
};
