<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devotional extends Model
{
    protected $fillable = ['title', 'content', 'verse', 'devotional_date'];
}
