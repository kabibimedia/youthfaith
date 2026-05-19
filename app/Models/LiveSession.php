<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LiveSession extends Model
{
    protected $fillable = ['user_id', 'title', 'status', 'viewer_count', 'heart_count', 'stream_path', 'stream_key', 'rtmp_url', 'started_at', 'ended_at'];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'viewer_count' => 'integer',
            'heart_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(LiveComment::class);
    }

    public function gifts(): HasMany
    {
        return $this->hasMany(LiveGift::class);
    }
}
