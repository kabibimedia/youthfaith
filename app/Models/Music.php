<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Music extends Model
{
    protected $fillable = ['title', 'artist', 'url', 'cover_url', 'category'];
}
