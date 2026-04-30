<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChallengeController extends Controller
{
    public function index(): JsonResponse
    {
        $challenges = Challenge::where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->orderBy('end_date')
            ->get();

        $user = Auth::user();
        $challenges = $challenges->map(function ($challenge) use ($user) {
            $participation = $user ? $challenge->users()->where('user_id', $user->id)->first() : null;
            $challenge->joined = $participation !== null;
            $challenge->completed = $participation?->pivot->completed ?? false;
            $challenge->participant_count = $challenge->users()->count();

            return $challenge;
        });

        return response()->json($challenges);
    }

    public function join(Request $request, int $id): JsonResponse
    {
        $challenge = Challenge::findOrFail($id);
        $user = $request->user();

        if (! $challenge->users()->where('user_id', $user->id)->exists()) {
            $challenge->users()->attach($user->id, ['completed' => false]);
        }

        return response()->json(['message' => 'Joined challenge successfully']);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $challenge = Challenge::findOrFail($id);
        $user = $request->user();

        $participation = $challenge->users()->where('user_id', $user->id)->first();

        if (! $participation) {
            return response()->json(['message' => 'You must join the challenge first'], 400);
        }

        if ($participation->pivot->completed) {
            return response()->json(['message' => 'Challenge already completed'], 400);
        }

        $challenge->users()->updateExistingPivot($user->id, [
            'completed' => true,
            'completed_at' => now(),
        ]);

        $user->increment('points', $challenge->points);
        $user->increment('streak');
        $user->update(['last_active_at' => now()]);

        return response()->json([
            'message' => 'Challenge completed!',
            'points_earned' => $challenge->points,
            'new_total_points' => $user->fresh()->points,
        ]);
    }
}
