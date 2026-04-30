<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Comment;
use App\Models\Event;
use App\Models\Post;
use App\Models\Prayer;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_posts' => Post::count(),
            'total_events' => Event::count(),
            'total_prayers' => Prayer::count(),
            'total_comments' => Comment::count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'active_users' => User::where('last_active_at', '>=', now()->subDays(7))->count(),
        ];

        $recent_users = User::latest()->limit(10)->get();
        $recent_posts = Post::with('user')->latest()->limit(10)->get();

        return response()->json([
            'stats' => $stats,
            'recent_users' => $recent_users,
            'recent_posts' => $recent_posts,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%");
        }

        if ($request->has('is_admin')) {
            $query->where('is_admin', $request->boolean('is_admin'));
        }

        $users = $query->latest()->paginate(20);

        return response()->json($users);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->only(['name', 'email', 'is_admin', 'points']));

        return response()->json($user);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function posts(Request $request)
    {
        $query = Post::with('user');

        if ($request->search) {
            $query->where('content', 'like', "%{$request->search}%");
        }

        $posts = $query->latest()->paginate(20);

        return response()->json($posts);
    }

    public function deletePost($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Post deleted']);
    }

    public function events(Request $request)
    {
        $query = Event::query();

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $events = $query->latest()->paginate(20);

        return response()->json($events);
    }

    public function createEvent(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'max_attendees' => 'nullable|integer',
        ]);

        $event = Event::create($validated);

        return response()->json($event, 201);
    }

    public function updateEvent(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $event->update($request->only(['title', 'description', 'event_date', 'location', 'max_attendees']));

        return response()->json($event);
    }

    public function deleteEvent($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Event deleted']);
    }

    public function prayers(Request $request)
    {
        $query = Prayer::with('user');

        if ($request->search) {
            $query->where('prayer_request', 'like', "%{$request->search}%");
        }

        $prayers = $query->latest()->paginate(20);

        return response()->json($prayers);
    }

    public function deletePrayer($id)
    {
        $prayer = Prayer::findOrFail($id);
        $prayer->delete();

        return response()->json(['message' => 'Prayer request deleted']);
    }

    public function comments(Request $request)
    {
        $query = Comment::with(['user', 'post']);

        if ($request->search) {
            $query->where('comment', 'like', "%{$request->search}%");
        }

        $comments = $query->latest()->paginate(20);

        return response()->json($comments);
    }

    public function deleteComment($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }

    public function announcements(Request $request)
    {
        $query = Announcement::query();

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $announcements = $query->latest()->paginate(20);

        return response()->json($announcements);
    }

    public function createAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'sometimes|string|in:info,success,warning,danger',
            'expires_at' => 'nullable|date',
        ]);

        $announcement = Announcement::create($validated);

        return response()->json($announcement, 201);
    }

    public function updateAnnouncement(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->update($request->only(['title', 'content', 'type', 'is_active', 'expires_at']));

        return response()->json($announcement);
    }

    public function deleteAnnouncement($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted']);
    }
}
