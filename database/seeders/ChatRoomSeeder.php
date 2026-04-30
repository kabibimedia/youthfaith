<?php

namespace Database\Seeders;

use App\Models\ChatRoom;
use App\Models\User;
use Illuminate\Database\Seeder;

class ChatRoomSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();

        $rooms = [
            ['name' => 'General Discussion', 'description' => 'Talk about anything faith-related', 'created_by' => $admin?->id ?? 1],
            ['name' => 'Prayer Requests', 'description' => 'Share prayer needs with the community', 'created_by' => $admin?->id ?? 1],
            ['name' => 'Youth Events', 'description' => 'Discuss upcoming youth events', 'created_by' => $admin?->id ?? 1],
            ['name' => 'Bible Study', 'description' => 'Deep dive into God\'s Word together', 'created_by' => $admin?->id ?? 1],
        ];

        foreach ($rooms as $room) {
            ChatRoom::create($room);
        }
    }
}
