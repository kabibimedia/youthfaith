<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Music;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MusicController extends Controller
{
    public function index(): JsonResponse
    {
        $music = Music::orderByDesc('created_at')->get()->map(function ($track) {
            if ($track->url && ! str_starts_with($track->url, 'http')) {
                $track->url = Storage::disk('public')->url($track->url);
            }
            if ($track->cover_url && ! str_starts_with($track->cover_url, 'http')) {
                $track->cover_url = Storage::disk('public')->url($track->cover_url);
            }

            return $track;
        });

        return response()->json($music);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'nullable|string|max:255',
            'url' => 'required_without:audio_file|url|nullable',
            'audio_file' => 'required_without:url|file|mimes:mp3,wav,ogg,aac,m4a|max:51200',
            'cover_url' => 'nullable|url',
            'cover_image' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
            'category' => 'nullable|string|max:100',
        ]);

        $data = $request->only(['title', 'artist', 'category']);

        if ($request->hasFile('audio_file')) {
            $data['url'] = $request->file('audio_file')->store('music', 'public');
        } else {
            $data['url'] = $request->url;
        }

        if ($request->hasFile('cover_image')) {
            $data['cover_url'] = $request->file('cover_image')->store('music/covers', 'public');
        } elseif ($request->cover_url) {
            $data['cover_url'] = $request->cover_url;
        }

        $music = Music::create($data);

        if ($music->url && ! str_starts_with($music->url, 'http')) {
            $music->url = Storage::disk('public')->url($music->url);
        }
        if ($music->cover_url && ! str_starts_with($music->cover_url, 'http')) {
            $music->cover_url = Storage::disk('public')->url($music->cover_url);
        }

        return response()->json($music, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $music = Music::findOrFail($id);

        if ($music->url && ! str_starts_with($music->url, 'http')) {
            Storage::disk('public')->delete($music->url);
        }
        if ($music->cover_url && ! str_starts_with($music->cover_url, 'http')) {
            Storage::disk('public')->delete($music->cover_url);
        }

        $music->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
