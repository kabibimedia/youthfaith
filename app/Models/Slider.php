<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Slider extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'image',
        'link_url',
        'sort_order',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    protected function getImageAttribute($value): string
    {
        if (! $value) {
            return '';
        }

        return str_starts_with($value, 'http') ? $value : url('storage/'.$value);
    }
}
