<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index(): JsonResponse
    {
        $rooms = ChatRoom::with('latestMessage', 'creator')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($rooms);
    }

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $room = ChatRoom::create([
            'name' => $request->name,
            'description' => $request->description,
            'created_by' => $request->user()->id,
        ]);

        return response()->json($room, 201);
    }

    public function show(int $id): JsonResponse
    {
        $room = ChatRoom::with(['messages.user', 'creator'])->findOrFail($id);

        return response()->json($room);
    }

    public function messages(int $id): JsonResponse
    {
        $room = ChatRoom::findOrFail($id);
        $messages = $room->messages()->with('user')->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    public function send(int $id, Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $room = ChatRoom::findOrFail($id);

        $message = $room->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        $message->load('user');

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }
}
