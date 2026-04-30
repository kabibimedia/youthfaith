<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    protected $fillable = ['title', 'description', 'event_date', 'location', 'image_url', 'max_attendees'];

    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_users');
    }
}
