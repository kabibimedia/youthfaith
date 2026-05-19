<?php

namespace App\Traits;

use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Request;

trait LogsAdminActivity
{
    protected function logAdminAction(string $action, ?string $details = null): void
    {
        AdminActivityLog::create([
            'user_id' => request()->user()->id,
            'action' => $action,
            'details' => $details,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
