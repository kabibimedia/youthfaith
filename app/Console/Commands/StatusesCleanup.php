<?php

namespace App\Console\Commands;

use App\Models\Status;
use Illuminate\Console\Command;

class StatusesCleanup extends Command
{
    protected $signature = 'statuses:cleanup';

    protected $description = 'Delete expired statuses (older than 24 hours)';

    public function handle(): void
    {
        $deleted = Status::expired()->delete();

        $this->info("Deleted {$deleted} expired status(es).");
    }
}
