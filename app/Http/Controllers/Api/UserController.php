<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BirthdayWish;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function upcomingBirthdays(): JsonResponse
    {
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();
        $in14Days = now()->addDays(14)->toDateString();

        $users = User::whereNotNull('date_of_birth')
            ->whereRaw('
                DATE_ADD(
                    date_of_birth,
                    INTERVAL YEAR(CURDATE()) - YEAR(date_of_birth)
                    + IF(DAYOFYEAR(date_of_birth) < DAYOFYEAR(CURDATE()), 1, 0) YEAR
                ) BETWEEN ? AND ?
            ', [$tomorrow, $in14Days])
            ->orderByRaw('
                DATE_ADD(
                    date_of_birth,
                    INTERVAL YEAR(CURDATE()) - YEAR(date_of_birth)
                    + IF(DAYOFYEAR(date_of_birth) < DAYOFYEAR(CURDATE()), 1, 0) YEAR
                )
            ')
            ->get(['id', 'name', 'surname', 'firstname', 'avatar', 'date_of_birth'])
            ->map(function ($user) {
                $next = $user->date_of_birth->copy()->setYear(now()->year);
                if ($next->isPast()) {
                    $next->addYear();
                }
                $user->in_days = $next->isToday() ? 'Today' : ($next->isTomorrow() ? 'Tomorrow' : 'In '.(int) now()->diffInDays($next).' days');

                return $user;
            });

        return response()->json($users);
    }

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

    public function useRegistrationPhoto(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->getRawOriginal('registration_photo')) {
            return response()->json(['message' => 'No registration photo found.'], 404);
        }

        $oldAvatar = $user->getRawOriginal('avatar');
        if ($oldAvatar) {
            Storage::disk('public')->delete($oldAvatar);
        }

        $path = $user->getRawOriginal('registration_photo');
        $user->update(['avatar' => $path]);

        return response()->json(['avatar' => $user->avatar]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048']);

        $user = $request->user();

        $old = $user->getRawOriginal('avatar');
        if ($old) {
            Storage::disk('public')->delete($old);
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
            ->whereNotNull('date_of_birth')
            ->get(['id', 'name', 'surname', 'firstname', 'avatar', 'date_of_birth']);

        return response()->json($users);
    }

    public function sendBirthdayWish(Request $request): JsonResponse
    {
        $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'message' => 'required|string|max:500',
        ]);

        $fromUser = $request->user();

        if ($fromUser->id === (int) $request->to_user_id) {
            return response()->json(['message' => 'Cannot send a wish to yourself.'], 422);
        }

        $wish = BirthdayWish::create([
            'to_user_id' => $request->to_user_id,
            'from_user_id' => $fromUser->id,
            'message' => $request->message,
        ]);

        $wish->load('fromUser');

        return response()->json($wish, 201);
    }

    public function getBirthdayWishes(Request $request): JsonResponse
    {
        $wishes = BirthdayWish::where('to_user_id', $request->user()->id)
            ->with('fromUser')
            ->latest()
            ->get();

        return response()->json($wishes);
    }
}
