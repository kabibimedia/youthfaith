<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Music;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MusicController extends Controller
{
    public function index(): JsonResponse
    {
        $music = Music::orderByDesc('created_at')->get();

        return response()->json($music);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'nullable|string|max:255',
            'url' => 'required|url',
            'cover_url' => 'nullable|url',
            'category' => 'nullable|string|max:100',
        ]);

        $music = Music::create($request->all());

        return response()->json($music, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $music = Music::findOrFail($id);
        $music->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
