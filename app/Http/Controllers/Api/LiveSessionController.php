<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LiveSessionController extends Controller
{
    public function index(): JsonResponse
    {
        $live = LiveSession::with('user:id,name,avatar')
            ->where('status', 'live')
            ->latest('started_at')
            ->get();

        return response()->json($live);
    }

    public function show(int $id): JsonResponse
    {
        $session = LiveSession::with([
            'user:id,name,avatar',
            'comments.user:id,name,avatar',
        ])->findOrFail($id);

        return response()->json($session);
    }

    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $existing = LiveSession::where('user_id', $request->user()->id)
            ->where('status', 'live')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You are already live'], 422);
        }

        $streamKey = Str::upper(Str::random(16));

        $session = $request->user()->liveSessions()->create([
            'title' => $request->title,
            'stream_key' => $streamKey,
            'rtmp_url' => 'rtmp://'.$request->getHost().':1935/live',
            'started_at' => now(),
        ]);

        $session->load('user:id,name,avatar');

        return response()->json($session, 201);
    }

    public function end(int $id, Request $request): JsonResponse
    {
        $session = LiveSession::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'live')
            ->firstOrFail();

        $session->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        if ($request->boolean('create_post') && $session->title) {
            $post = $request->user()->posts()->create([
                'content' => '🔴 Live ended: '.$session->title,
                'post_type' => 'text',
            ]);
        }

        return response()->json(['message' => 'Live ended']);
    }

    public function comment(int $id, Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:500']);

        $session = LiveSession::where('id', $id)->where('status', 'live')->firstOrFail();

        $comment = $session->comments()->create([
            'user_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        $comment->load('user:id,name,avatar');

        return response()->json($comment, 201);
    }

    public function comments(int $id, Request $request): JsonResponse
    {
        $session = LiveSession::findOrFail($id);

        $comments = $session->comments()
            ->with('user:id,name,avatar')
            ->latest()
            ->limit(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json($comments);
    }

    public function join(int $id): JsonResponse
    {
        $session = LiveSession::where('id', $id)->where('status', 'live')->firstOrFail();
        $session->increment('viewer_count');

        return response()->json(['viewer_count' => $session->fresh()->viewer_count]);
    }

    public function leave(int $id): JsonResponse
    {
        $session = LiveSession::where('id', $id)->where('status', 'live')->firstOrFail();
        if ($session->viewer_count > 0) {
            $session->decrement('viewer_count');
        }

        return response()->json(['viewer_count' => $session->fresh()->viewer_count]);
    }

    public function heart(int $id): JsonResponse
    {
        $session = LiveSession::where('id', $id)->where('status', 'live')->firstOrFail();
        $session->increment('heart_count');

        return response()->json(['heart_count' => $session->fresh()->heart_count]);
    }

    public function gift(int $id, Request $request): JsonResponse
    {
        $request->validate(['gift_type' => 'required|string|max:50']);

        $session = LiveSession::where('id', $id)->where('status', 'live')->firstOrFail();

        $gift = $session->gifts()->create([
            'user_id' => $request->user()->id,
            'gift_type' => $request->gift_type,
        ]);

        $gift->load('user:id,name,avatar');

        return response()->json($gift, 201);
    }

    public function gifts(int $id): JsonResponse
    {
        $session = LiveSession::findOrFail($id);

        $gifts = $session->gifts()
            ->with('user:id,name,avatar')
            ->latest()
            ->limit(50)
            ->get();

        return response()->json($gifts);
    }

    public function setup(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $existing = LiveSession::where('user_id', $request->user()->id)
            ->whereIn('status', ['live', 'pending'])
            ->first();

        if ($existing) {
            return response()->json([
                'stream_key' => $existing->stream_key,
                'rtmp_url' => $existing->rtmp_url,
                'play_url' => url('/hls/'.$existing->stream_key.'.m3u8'),
                'session' => $existing->load('user:id,name,avatar'),
                'message' => $existing->status === 'live' ? 'You are already live' : 'You already have a pending setup',
            ]);
        }

        $streamKey = Str::upper(Str::random(16));
        $rtmpUrl = 'rtmp://'.$request->getHost().':1935/live';

        $session = $request->user()->liveSessions()->create([
            'title' => $request->title ?? 'Live Stream',
            'stream_key' => $streamKey,
            'rtmp_url' => $rtmpUrl,
            'status' => 'pending',
            'started_at' => now(),
        ]);

        $session->load('user:id,name,avatar');

        return response()->json([
            'stream_key' => $streamKey,
            'rtmp_url' => $rtmpUrl,
            'play_url' => url('/hls/'.$streamKey.'.m3u8'),
            'session' => $session,
        ], 201);
    }

    public function activate(int $id, Request $request): JsonResponse
    {
        $session = LiveSession::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $session->update(['status' => 'live']);

        return response()->json(['message' => 'Stream activated', 'session' => $session->fresh()->load('user:id,name,avatar')]);
    }

    public function verifyStreamKey(Request $request): JsonResponse
    {
        $request->validate(['stream_key' => 'required|string']);

        $session = LiveSession::where('stream_key', $request->stream_key)
            ->where('status', 'live')
            ->first();

        if (! $session) {
            return response()->json(['valid' => false], 403);
        }

        return response()->json(['valid' => true, 'session_id' => $session->id]);
    }
}
