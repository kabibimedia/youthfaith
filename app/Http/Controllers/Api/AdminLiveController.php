<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use App\Traits\LogsAdminActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminLiveController extends Controller
{
    use LogsAdminActivity;

    private function ensureAdmin(): void
    {
        if (! request()->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }
    }

    public function index(): JsonResponse
    {
        $this->ensureAdmin();

        $sessions = LiveSession::with('user:id,name')
            ->latest()
            ->paginate(20);

        return response()->json($sessions);
    }

    public function generateStreamKey(): JsonResponse
    {
        $this->ensureAdmin();

        $key = Str::upper(Str::random(16));

        return response()->json([
            'stream_key' => $key,
            'rtmp_url' => 'rtmp://' . request()->getHost() . ':1935/live',
            'play_url' => url('/hls/' . $key . '.m3u8'),
        ]);
    }

    public function assignStreamKey(Request $request, LiveSession $session): JsonResponse
    {
        $this->ensureAdmin();

        $request->validate(['stream_key' => 'required|string|size:16|unique:live_sessions,stream_key']);

        $session->update([
            'stream_key' => $request->stream_key,
            'rtmp_url' => 'rtmp://' . request()->getHost() . ':1935/live',
        ]);

        $this->logAdminAction('stream_key_assigned', "Assigned stream key to session #{$session->id}");

        return response()->json($session);
    }

    public function activeStreams(): JsonResponse
    {
        $this->ensureAdmin();

        $streams = LiveSession::with('user:id,name,avatar')
            ->where('status', 'live')
            ->latest('started_at')
            ->get();

        return response()->json($streams);
    }

    public function forceEndStream(LiveSession $session): JsonResponse
    {
        $this->ensureAdmin();

        $session->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        $this->logAdminAction('stream_force_ended', "Force ended stream #{$session->id} by {$session->user?->name}");

        return response()->json(['message' => 'Stream ended']);
    }
}
