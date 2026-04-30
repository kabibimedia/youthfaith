<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prayer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrayerController extends Controller
{
    public function index(): JsonResponse
    {
        $prayers = Prayer::orderByDesc('created_at')->get();

        return response()->json($prayers);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'prayer_request' => 'required|string|max:1000',
            'name' => 'nullable|string|max:100',
            'is_anonymous' => 'boolean',
        ]);

        $prayer = Prayer::create([
            'prayer_request' => $request->prayer_request,
            'name' => $request->is_anonymous ? null : ($request->name ?? $request->user()->name),
            'is_anonymous' => $request->boolean('is_anonymous', true),
            'user_id' => $request->user()->id ?? null,
        ]);

        return response()->json($prayer, 201);
    }

    public function pray(int $id): JsonResponse
    {
        $prayer = Prayer::findOrFail($id);
        $prayer->increment('prayer_count');

        return response()->json(['prayer_count' => $prayer->prayer_count]);
    }
}
