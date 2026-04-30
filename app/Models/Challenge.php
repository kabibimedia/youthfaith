<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $fillable = [
        'title',
        'description',
        'emoji',
        'points',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'challenge_participants')
            ->withPivot('completed', 'completed_at')
            ->withTimestamps();
    }

    public function isActive(): bool
    {
        $now = now()->toDateString();

        return $this->is_active && $now >= $this->start_date && $now <= $this->end_date;
    }
}
