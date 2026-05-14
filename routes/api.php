<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminDuesController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DevotionalController;
use App\Http\Controllers\Api\DuesController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\MusicController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PrayerController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\UserController;
use App\Models\Slider;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

    Route::get('/posts', [AdminController::class, 'posts']);
    Route::delete('/posts/{id}', [AdminController::class, 'deletePost']);

    Route::get('/events', [AdminController::class, 'events']);
    Route::post('/events', [AdminController::class, 'createEvent']);
    Route::put('/events/{id}', [AdminController::class, 'updateEvent']);
    Route::delete('/events/{id}', [AdminController::class, 'deleteEvent']);

    Route::get('/prayers', [AdminController::class, 'prayers']);
    Route::delete('/prayers/{id}', [AdminController::class, 'deletePrayer']);

    Route::get('/comments', [AdminController::class, 'comments']);
    Route::delete('/comments/{id}', [AdminController::class, 'deleteComment']);

    Route::get('/announcements', [AdminController::class, 'announcements']);
    Route::post('/announcements', [AdminController::class, 'createAnnouncement']);
    Route::put('/announcements/{id}', [AdminController::class, 'updateAnnouncement']);
    Route::delete('/announcements/{id}', [AdminController::class, 'deleteAnnouncement']);

    Route::get('/challenges', [AdminController::class, 'challenges']);
    Route::post('/challenges', [AdminController::class, 'createChallenge']);
    Route::put('/challenges/{id}', [AdminController::class, 'updateChallenge']);
    Route::delete('/challenges/{id}', [AdminController::class, 'deleteChallenge']);

    Route::get('/quizzes', [AdminController::class, 'quizzes']);
    Route::post('/quizzes', [AdminController::class, 'createQuiz']);
    Route::put('/quizzes/{id}', [AdminController::class, 'updateQuiz']);
    Route::delete('/quizzes/{id}', [AdminController::class, 'deleteQuiz']);

    Route::get('/blogs', [AdminController::class, 'blogs']);
    Route::put('/blogs/{id}', [AdminController::class, 'updateBlog']);
    Route::delete('/blogs/{id}', [AdminController::class, 'deleteBlog']);

    Route::get('/sliders', [AdminController::class, 'sliders']);
    Route::post('/sliders', [AdminController::class, 'createSlider']);
    Route::post('/sliders/bulk-upload', [AdminController::class, 'bulkUploadSliders']);
    Route::post('/sliders/{id}', [AdminController::class, 'updateSlider'])->whereNumber('id');
    Route::delete('/sliders/{id}', [AdminController::class, 'deleteSlider'])->whereNumber('id');

    Route::get('/clients', [AdminController::class, 'clients']);
    Route::get('/clients/export', [AdminController::class, 'exportClients']);
    Route::post('/upload', [AdminController::class, 'uploadFile']);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'adminLogin']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
});

Route::prefix('users')->group(function () {
    Route::get('/leaderboard', [UserController::class, 'leaderboard']);
    Route::get('/birthdays', [UserController::class, 'birthdays']);
    Route::get('/birthdays/upcoming', [UserController::class, 'upcomingBirthdays']);
    Route::post('/birthdays/wish', [UserController::class, 'sendBirthdayWish'])->middleware('auth:sanctum');
    Route::get('/birthdays/wishes', [UserController::class, 'getBirthdayWishes'])->middleware('auth:sanctum');
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/', [UserController::class, 'update'])->middleware('auth:sanctum');
    Route::post('/avatar', [UserController::class, 'uploadAvatar'])->middleware('auth:sanctum');
    Route::post('/use-registration-photo', [UserController::class, 'useRegistrationPhoto'])->middleware('auth:sanctum');
    Route::post('/points', [UserController::class, 'updatePoints'])->middleware('auth:sanctum');
});

Route::prefix('posts')->group(function () {
    Route::get('/', [PostController::class, 'index'])->middleware('auth:sanctum');
    Route::post('/', [PostController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/{id}', [PostController::class, 'show']);
    Route::put('/{id}', [PostController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{id}', [PostController::class, 'destroy'])->middleware('auth:sanctum');
    Route::post('/{id}/like', [PostController::class, 'like'])->middleware('auth:sanctum');
    Route::post('/{id}/comment', [PostController::class, 'comment'])->middleware('auth:sanctum');
    Route::get('/{id}/comments', [PostController::class, 'comments']);
    Route::post('/{id}/share', [PostController::class, 'share'])->middleware('auth:sanctum');
});

Route::prefix('events')->group(function () {
    Route::get('/', [EventController::class, 'index']);
    Route::post('/', [EventController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/{id}', [EventController::class, 'show']);
    Route::post('/{id}/join', [EventController::class, 'join'])->middleware('auth:sanctum');
    Route::post('/{id}/leave', [EventController::class, 'leave'])->middleware('auth:sanctum');
});

Route::prefix('devotionals')->group(function () {
    Route::get('/', [DevotionalController::class, 'index']);
    Route::get('/today', [DevotionalController::class, 'today']);
    Route::post('/', [DevotionalController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/{id}', [DevotionalController::class, 'show']);
});

Route::prefix('quizzes')->group(function () {
    Route::get('/', [QuizController::class, 'index']);
    Route::post('/submit', [QuizController::class, 'submit'])->middleware('auth:sanctum');
    Route::get('/leaderboard', [QuizController::class, 'leaderboard']);
});

Route::prefix('chat')->group(function () {
    Route::get('/', [ChatController::class, 'index']);
    Route::post('/', [ChatController::class, 'create'])->middleware('auth:sanctum');
    Route::get('/{id}', [ChatController::class, 'show']);
    Route::get('/{id}/messages', [ChatController::class, 'messages']);
    Route::post('/{id}/messages', [ChatController::class, 'send'])->middleware('auth:sanctum');
});

Route::prefix('prayers')->group(function () {
    Route::get('/', [PrayerController::class, 'index']);
    Route::post('/', [PrayerController::class, 'store'])->middleware('auth:sanctum');
    Route::post('/{id}/pray', [PrayerController::class, 'pray']);
});

Route::prefix('music')->group(function () {
    Route::get('/', [MusicController::class, 'index']);
    Route::post('/', [MusicController::class, 'store'])->middleware('auth:sanctum');
    Route::delete('/{id}', [MusicController::class, 'destroy'])->middleware('auth:sanctum');
});

Route::prefix('challenges')->group(function () {
    Route::get('/', [ChallengeController::class, 'index']);
    Route::post('/{id}/join', [ChallengeController::class, 'join'])->middleware('auth:sanctum');
    Route::post('/{id}/complete', [ChallengeController::class, 'complete'])->middleware('auth:sanctum');
});

Route::prefix('statuses')->group(function () {
    Route::get('/', [StatusController::class, 'index']);
    Route::get('/my', [StatusController::class, 'myStatuses'])->middleware('auth:sanctum');
    Route::post('/', [StatusController::class, 'store'])->middleware('auth:sanctum');
    Route::delete('/{id}', [StatusController::class, 'destroy'])->middleware('auth:sanctum');
    Route::post('/cleanup', [StatusController::class, 'cleanup'])->middleware('auth:sanctum');
    Route::post('/share/{postId}', [StatusController::class, 'sharePost'])->middleware('auth:sanctum');
});

Route::get('/sliders', function () {
    return Slider::where('is_active', true)
        ->where(function ($q) {
            $q->whereNull('start_date')->orWhere('start_date', '<=', now()->toDateString());
        })
        ->where(function ($q) {
            $q->whereNull('end_date')->orWhere('end_date', '>=', now()->toDateString());
        })
        ->orderBy('sort_order')
        ->orderByDesc('created_at')
        ->get();
});

Route::prefix('announcements')->group(function () {
    Route::get('/active', [AnnouncementController::class, 'active']);
    Route::get('/', [AnnouncementController::class, 'index'])->middleware('auth:sanctum');
    Route::post('/', [AnnouncementController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [AnnouncementController::class, 'update'])->middleware('auth:sanctum');
    Route::post('/{id}/featured', [AnnouncementController::class, 'setFeatured'])->middleware('auth:sanctum');
    Route::delete('/{id}', [AnnouncementController::class, 'destroy'])->middleware('auth:sanctum');
});

Route::prefix('blogs')->group(function () {
    Route::get('/', [BlogController::class, 'index']);
    Route::get('/{id}', [BlogController::class, 'show']);
    Route::post('/', [BlogController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [BlogController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{id}', [BlogController::class, 'destroy'])->middleware('auth:sanctum');
    Route::get('/my/list', [BlogController::class, 'myBlogs'])->middleware('auth:sanctum');
});

Route::prefix('dues')->middleware('auth:sanctum')->group(function () {
    Route::get('/overview', [DuesController::class, 'overview']);
    Route::get('/payments', [DuesController::class, 'payments']);
    Route::get('/statement', [DuesController::class, 'statement']);
    Route::get('/statement/pdf', [DuesController::class, 'statementPdf']);
    Route::post('/pay', [DuesController::class, 'store']);
    Route::get('/pledges', [DuesController::class, 'pledges']);
    Route::post('/pledges', [DuesController::class, 'storePledge']);
    Route::put('/pledges/{pledge}/cancel', [DuesController::class, 'cancelPledge']);
});

Route::prefix('admin/dues')->middleware('auth:sanctum')->group(function () {
    Route::get('/payments', [AdminDuesController::class, 'payments']);
    Route::post('/payments/{payment}/approve', [AdminDuesController::class, 'approve']);
    Route::post('/payments/{payment}/reject', [AdminDuesController::class, 'reject']);
    Route::post('/payments/upload', [AdminDuesController::class, 'uploadPayment']);
    Route::get('/members', [AdminDuesController::class, 'members']);
    Route::post('/codes/generate', [AdminDuesController::class, 'generateCodes']);
});
