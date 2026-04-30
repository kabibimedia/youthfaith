<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function active(): JsonResponse
    {
        $announcement = Announcement::featured()->first();

        if (! $announcement) {
            $announcement = Announcement::active()->latest()->first();
        }

        return response()->json($announcement);
    }

    public function index(): JsonResponse
    {
        $announcements = Announcement::latest()->get();

        return response()->json($announcements);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'sometimes|string|in:info,success,warning,danger',
            'is_featured' => 'sometimes|boolean',
            'expires_at' => 'nullable|date',
        ]);

        $announcement = Announcement::create($request->only(['title', 'content', 'type', 'is_featured', 'expires_at']));

        if ($announcement->is_featured) {
            Announcement::where('id', '!=', $announcement->id)->update(['is_featured' => false]);
        }

        return response()->json($announcement, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'type' => 'sometimes|string|in:info,success,warning,danger',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'expires_at' => 'nullable|date',
        ]);

        $announcement->update($request->only(['title', 'content', 'type', 'is_active', 'is_featured', 'expires_at']));

        if ($announcement->is_featured) {
            Announcement::where('id', '!=', $announcement->id)->update(['is_featured' => false]);
        }

        return response()->json($announcement);
    }

    public function setFeatured(int $id): JsonResponse
    {
        Announcement::setFeatured($id);

        return response()->json(['message' => 'Announcement set as featured']);
    }

    public function destroy(int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted']);
    }
}
