<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function show(int $id): JsonResponse
    {
        $user = User::with(['posts', 'events'])->findOrFail($id);

        return response()->json($user);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:500',
            'favorite_verse' => 'sometimes|string|max:255',
        ]);

        $user->update($request->only(['name', 'bio', 'favorite_verse']));

        return response()->json($user);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048']);

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json(['avatar' => $path]);
    }

    public function updatePoints(Request $request): JsonResponse
    {
        $request->validate(['points' => 'required|integer']);

        $user = $request->user();
        $user->increment('points', $request->points);

        return response()->json(['points' => $user->points]);
    }

    public function leaderboard(): JsonResponse
    {
        $users = User::orderByDesc('points')
            ->limit(20)
            ->get(['id', 'name', 'avatar', 'points', 'streak']);

        return response()->json($users);
    }

    public function birthdays(): JsonResponse
    {
        $today = now();
        $birthdayMonth = $today->month;
        $birthdayDay = $today->day;

        $users = User::whereMonth('date_of_birth', $birthdayMonth)
            ->whereDay('date_of_birth', $birthdayDay)
            ->get(['id', 'name', 'avatar', 'date_of_birth']);

        return response()->json($users);
    }
}
