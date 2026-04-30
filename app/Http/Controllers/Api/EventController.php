<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::orderBy('event_date')->get();

        return response()->json($events);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'event_date' => 'required|date',
            'location' => 'required|string|max:255',
            'image_url' => 'nullable|string',
            'max_attendees' => 'nullable|integer',
        ]);

        $event = Event::create($request->all());

        return response()->json($event, 201);
    }

    public function show(int $id): JsonResponse
    {
        $event = Event::with('attendees')->findOrFail($id);

        return response()->json($event);
    }

    public function join(int $id, Request $request): JsonResponse
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        if ($event->max_attendees && $event->attendees()->count() >= $event->max_attendees) {
            return response()->json(['message' => 'Event is full'], 400);
        }

        if ($event->attendees()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Already joined'], 400);
        }

        $event->attendees()->attach($user->id);
        $user->increment('points', 5);

        return response()->json(['message' => 'Joined successfully']);
    }

    public function leave(int $id, Request $request): JsonResponse
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        $event->attendees()->detach($user->id);

        return response()->json(['message' => 'Left successfully']);
    }
}
