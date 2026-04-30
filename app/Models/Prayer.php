<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prayer extends Model
{
    protected $fillable = ['prayer_request', 'name', 'is_anonymous', 'user_id', 'prayer_count'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
