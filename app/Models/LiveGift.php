<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveGift extends Model
{
    protected $fillable = ['live_session_id', 'user_id', 'gift_type'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function liveSession(): BelongsTo
    {
        return $this->belongsTo(LiveSession::class);
    }
}
