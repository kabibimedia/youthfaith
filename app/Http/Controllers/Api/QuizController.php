<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(): JsonResponse
    {
        $quizzes = Quiz::orderByDesc('created_at')->get();

        return response()->json($quizzes);
    }

    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'answer' => 'required|integer',
        ]);

        $quiz = Quiz::findOrFail($request->quiz_id);
        $user = $request->user();

        $isCorrect = $quiz->correct_answer === $request->answer;
        $pointsEarned = $isCorrect ? $quiz->points : 0;

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $user->id,
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
        ]);

        if ($isCorrect) {
            $user->increment('points', $pointsEarned);
        }

        return response()->json([
            'correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'correct_answer' => $quiz->correct_answer,
        ]);
    }

    public function leaderboard(): JsonResponse
    {
        $leaderboard = QuizAttempt::with('user')
            ->selectRaw('user_id, SUM(points_earned) as total_points')
            ->groupBy('user_id')
            ->orderByDesc('total_points')
            ->limit(20)
            ->get();

        return response()->json($leaderboard);
    }
}
