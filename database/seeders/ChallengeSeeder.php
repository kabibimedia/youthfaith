<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChallengeSeeder extends Seeder
{
    public function run(): void
    {
        $challenges = [
            [
                'title' => 'Gratitude Challenge',
                'description' => 'Post 3 things you\'re grateful for today!',
                'emoji' => '🙏',
                'points' => 50,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(7)->toDateString(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Bible Reader',
                'description' => 'Read any 5 chapters of the Bible this week',
                'emoji' => '📖',
                'points' => 100,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(30)->toDateString(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Prayer Warrior',
                'description' => 'Pray for 3 different people today',
                'emoji' => '🛡️',
                'points' => 30,
                'start_date' => now()->toDateString(),
                'end_date' => now()->toDateString(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Share Your Faith',
                'description' => 'Share your testimony with a friend this week',
                'emoji' => '✝️',
                'points' => 75,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(30)->toDateString(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Worship Leader',
                'description' => 'Listen to 3 worship songs and rate them',
                'emoji' => '🎵',
                'points' => 25,
                'start_date' => now()->toDateString(),
                'end_date' => now()->toDateString(),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('challenges')->insert($challenges);
    }
}
