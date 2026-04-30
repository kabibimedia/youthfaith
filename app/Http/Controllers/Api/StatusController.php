<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StatusController extends Controller
{
    public function index(): JsonResponse
    {
        $statuses = Status::with(['user' => function ($query) {
            $query->select('id', 'name', 'avatar');
        }])
            ->active()
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('user_id');

        return response()->json($statuses);
    }

    public function myStatuses(Request $request): JsonResponse
    {
        $statuses = Status::where('user_id', $request->user()->id)
            ->active()
            ->orderByDesc('created_at')
            ->get();

        return response()->json($statuses);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:text,image,video',
            'content' => 'nullable|string|max:500',
            'media' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4,webm|max:20480',
        ]);

        $mediaUrl = null;
        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('statuses', 'public');
            $mediaUrl = $path;
        }

        $status = Status::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'content' => $request->content,
            'media_url' => $mediaUrl,
            'expires_at' => now()->addHours(24),
        ]);

        $status->load(['user' => function ($query) {
            $query->select('id', 'name', 'avatar');
        }]);

        return response()->json($status, 201);
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $status = Status::where('user_id', $request->user()->id)->findOrFail($id);

        if ($status->media_url) {
            Storage::disk('public')->delete($status->media_url);
        }

        $status->delete();

        return response()->json(['message' => 'Status deleted']);
    }

    public function cleanup(): JsonResponse
    {
        $expired = Status::expired()->delete();

        return response()->json(['deleted' => $expired]);
    }
}
