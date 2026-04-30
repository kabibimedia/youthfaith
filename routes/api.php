<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DevotionalController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\MusicController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PrayerController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\UserController;
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
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
});

Route::prefix('users')->group(function () {
    Route::get('/leaderboard', [UserController::class, 'leaderboard']);
    Route::get('/birthdays', [UserController::class, 'birthdays']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/', [UserController::class, 'update'])->middleware('auth:sanctum');
    Route::post('/avatar', [UserController::class, 'uploadAvatar'])->middleware('auth:sanctum');
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
    Route::post('/cleanup', [StatusController::class, 'cleanup']);
});

Route::prefix('announcements')->group(function () {
    Route::get('/active', [AnnouncementController::class, 'active']);
    Route::get('/', [AnnouncementController::class, 'index'])->middleware('auth:sanctum');
    Route::post('/', [AnnouncementController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [AnnouncementController::class, 'update'])->middleware('auth:sanctum');
    Route::post('/{id}/featured', [AnnouncementController::class, 'setFeatured'])->middleware('auth:sanctum');
    Route::delete('/{id}', [AnnouncementController::class, 'destroy'])->middleware('auth:sanctum');
});
