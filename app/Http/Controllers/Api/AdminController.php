<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Blog;
use App\Models\Challenge;
use App\Models\Comment;
use App\Models\DuesPayment;
use App\Models\Event;
use App\Models\Post;
use App\Models\Prayer;
use App\Models\Quiz;
use App\Models\Slider;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_posts' => Post::count(),
            'total_challenges' => Challenge::count(),
            'total_events' => Event::count(),
            'total_prayers' => Prayer::count(),
            'total_comments' => Comment::count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'active_users' => User::where('last_active_at', '>=', now()->subDays(7))->count(),
            'total_dues_collected' => (float) DuesPayment::where('status', 'approved')->sum('amount'),
            'pending_payments' => DuesPayment::where('status', 'pending')->count(),
            'pending_amount' => (float) DuesPayment::where('status', 'pending')->sum('amount'),
            'total_members' => User::where('is_member', true)->orWhere('has_dues_card', true)->count(),
            'members_with_card' => User::whereNotNull('dues_card_code')->count(),
            'dues_this_month' => (float) DuesPayment::where('status', 'approved')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
            'pending_approvals_today' => DuesPayment::where('status', 'pending')
                ->whereDate('created_at', today())
                ->count(),
        ];

        $monthlyDues = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyDues->push([
                'month' => $date->format('M'),
                'year' => $date->format('Y'),
                'total' => (float) DuesPayment::where('status', 'approved')
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->sum('amount'),
                'count' => DuesPayment::where('status', 'approved')
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
            ]);
        }

        $paymentStatusStats = [
            'approved' => DuesPayment::where('status', 'approved')->count(),
            'pending' => DuesPayment::where('status', 'pending')->count(),
            'rejected' => DuesPayment::where('status', 'rejected')->count(),
        ];

        $typeDistribution = [
            'dues' => (float) DuesPayment::where('status', 'approved')->where('type', 'dues')->sum('amount'),
            'contribution' => (float) DuesPayment::where('status', 'approved')->where('type', 'contribution')->sum('amount'),
            'pledge' => (float) DuesPayment::where('status', 'approved')->where('type', 'pledge')->sum('amount'),
        ];

        $memberGrowth = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $memberGrowth->push([
                'month' => $date->format('M'),
                'members' => User::where('is_member', true)
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
                'registrations' => User::whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
            ]);
        }

        $recent_users = User::latest()->limit(10)->get();
        $recent_posts = Post::with('user')->latest()->limit(10)->get();
        $pending_payments = DuesPayment::with('user:id,name')
            ->where('status', 'pending')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => $stats,
            'monthly_dues' => $monthlyDues,
            'payment_status_stats' => $paymentStatusStats,
            'type_distribution' => $typeDistribution,
            'member_growth' => $memberGrowth,
            'recent_users' => $recent_users,
            'recent_posts' => $recent_posts,
            'pending_payments' => $pending_payments,
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
        $user->update($request->only(['name', 'email', 'is_admin', 'role', 'points']));

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

    public function challenges(Request $request)
    {
        $query = Challenge::query();

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $challenges = $query->latest()->paginate(20);

        return response()->json($challenges);
    }

    public function createChallenge(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'emoji' => 'nullable|string|max:10',
            'points' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $validated['emoji'] = $validated['emoji'] ?? '⚡';
        $validated['is_active'] = true;

        $challenge = Challenge::create($validated);

        return response()->json($challenge, 201);
    }

    public function updateChallenge(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'emoji' => 'nullable|string|max:10',
            'points' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'is_active' => 'sometimes|boolean',
        ]);

        $challenge->update($validated);

        return response()->json($challenge);
    }

    public function deleteChallenge($id)
    {
        $challenge = Challenge::findOrFail($id);
        $challenge->delete();

        return response()->json(['message' => 'Challenge deleted']);
    }

    public function quizzes(Request $request)
    {
        $query = Quiz::query();

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $quizzes = $query->latest()->paginate(20);

        return response()->json($quizzes);
    }

    public function createQuiz(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'question' => 'required|string',
            'options' => 'required|array|min:2|max:10',
            'options.*' => 'required|string|max:255',
            'correct_answer' => 'required|integer|min:0|max:9',
            'points' => 'required|integer|min:1',
        ]);

        $quiz = Quiz::create($validated);

        return response()->json($quiz, 201);
    }

    public function updateQuiz(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'question' => 'sometimes|string',
            'options' => 'sometimes|array|min:2|max:10',
            'options.*' => 'sometimes|string|max:255',
            'correct_answer' => 'sometimes|integer|min:0',
            'points' => 'sometimes|integer|min:1',
        ]);

        $quiz->update($validated);

        return response()->json($quiz);
    }

    public function deleteQuiz($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted']);
    }

    public function blogs(Request $request)
    {
        $query = Blog::with('author:id,name');

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $blogs = $query->latest()->paginate(20);

        return response()->json($blogs);
    }

    public function updateBlog(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string|max:500',
            'video_url' => 'nullable|url|max:2048',
            'is_published' => 'sometimes|boolean',
        ]);

        if (isset($validated['is_published']) && $validated['is_published'] && ! $blog->published_at) {
            $validated['published_at'] = now();
        }

        $blog->update($validated);

        return response()->json($blog->load('author:id,name'));
    }

    public function deleteBlog($id)
    {
        $blog = Blog::findOrFail($id);
        $blog->delete();

        return response()->json(['message' => 'Blog deleted']);
    }

    public function sliders()
    {
        $sliders = Slider::orderBy('sort_order')->orderByDesc('created_at')->get();

        return response()->json($sliders);
    }

    public function createSlider(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:10240',
            'link_url' => 'nullable|url|max:2048',
            'sort_order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $data = [
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'link_url' => $request->link_url,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'image' => $request->file('image')->store('sliders', 'public'),
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ];

        $slider = Slider::create($data);

        return response()->json($slider, 201);
    }

    public function updateSlider(Request $request, $id)
    {
        $slider = Slider::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'link_url' => 'nullable|url|max:2048',
            'sort_order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            $request->validate([
                'image' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:10240',
            ]);
        }

        $data = [];

        foreach (['title', 'subtitle', 'link_url', 'start_date', 'end_date', 'sort_order'] as $field) {
            if ($request->exists($field)) {
                $value = $request->{$field};
                if ($value === null || $value === '') {
                    if (in_array($field, ['start_date', 'end_date', 'subtitle', 'link_url'])) {
                        $value = null;
                    } elseif ($field === 'title') {
                        $value = '';
                    }
                }
                $data[$field] = $value;
            }
        }

        if ($request->hasFile('image')) {
            $oldImage = $slider->getRawOriginal('image');
            if ($oldImage) {
                Storage::disk('public')->delete($oldImage);
            }
            $data['image'] = $request->file('image')->store('sliders', 'public');
        }

        if ($request->exists('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        if (! empty($data)) {
            $slider->update($data);
        }

        return response()->json($slider->fresh());
    }

    public function deleteSlider($id)
    {
        $slider = Slider::findOrFail($id);
        $oldImage = $slider->getRawOriginal('image');
        if ($oldImage) {
            Storage::disk('public')->delete($oldImage);
        }
        $slider->delete();

        return response()->json(['message' => 'Slider deleted']);
    }

    public function bulkUploadSliders(Request $request)
    {
        $request->validate([
            'images' => 'required|array|min:1|max:20',
            'images.*' => 'required|file|image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        $nextOrder = Slider::max('sort_order') + 1;
        $created = [];

        foreach ($request->file('images') as $file) {
            $slider = Slider::create([
                'title' => '',
                'image' => $file->store('sliders', 'public'),
                'sort_order' => $nextOrder++,
                'is_active' => true,
            ]);
            $created[] = $slider;
        }

        return response()->json($created, 201);
    }

    public function clients(Request $request)
    {
        $query = User::where('is_member', true);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('surname', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('othername', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('dues_card_code', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('surname')->orderBy('firstname')->paginate(20);
    }

    public function exportClients(Request $request)
    {
        $query = User::where('is_member', true);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('dues_card_code', 'like', "%{$search}%");
            });
        }

        $clients = $query->orderBy('name')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="clients-export-'.now()->format('Y-m-d').'.csv"',
        ];

        $callback = function () use ($clients) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Surname', 'First Name', 'Other Name', 'Email', 'Username', 'Role', 'Dues Card Code', 'Location', 'Date of Birth', 'Member Since']);

            foreach ($clients as $client) {
                fputcsv($handle, [
                    $client->surname ?? '',
                    $client->firstname ?? '',
                    $client->othername ?? '',
                    $client->email,
                    $client->username,
                    $client->role ?? '',
                    $client->dues_card_code ?? '',
                    $client->location ?? '',
                    $client->date_of_birth ?? '',
                    $client->created_at->format('Y-m-d'),
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'type' => 'required|in:clients,dues',
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $headers = fgetcsv($handle);
        $headers = array_map('trim', $headers);

        $imported = 0;
        $errors = [];

        if ($request->type === 'clients') {
            while (($row = fgetcsv($handle)) !== false) {
                $data = array_combine($headers, array_map('trim', $row));

                $surname = $data['surname'] ?? '';
                $firstname = $data['firstname'] ?? '';
                $email = $data['email'] ?? '';
                $username = $data['username'] ?? '';

                if ((empty($surname) && empty($firstname)) || empty($email)) {
                    $errors[] = 'Row '.($imported + 2).': surname/firstname and email are required';

                    continue;
                }

                if (User::where('email', $email)->exists()) {
                    $errors[] = 'Row '.($imported + 2).": email {$email} already exists";

                    continue;
                }

                $fullName = trim(implode(' ', array_filter([$surname, $firstname, $data['othername'] ?? ''])));

                User::create([
                    'name' => $fullName,
                    'surname' => $surname,
                    'firstname' => $firstname,
                    'othername' => $data['othername'] ?? null,
                    'email' => $email,
                    'username' => $username ?: explode('@', $email)[0],
                    'password' => bcrypt('password'),
                    'is_member' => true,
                    'date_of_birth' => $data['date_of_birth'] ?? null,
                    'location' => $data['location'] ?? null,
                ]);

                $imported++;
            }
        } else {
            while (($row = fgetcsv($handle)) !== false) {
                $data = array_combine($headers, array_map('trim', $row));

                $identifier = $data['email'] ?? $data['dues_card_code'] ?? '';
                $amount = $data['amount'] ?? '';

                if (empty($identifier) || empty($amount)) {
                    $errors[] = 'Row '.($imported + 2).': email/dues_card_code and amount are required';

                    continue;
                }

                $user = User::where('email', $identifier)
                    ->orWhere('dues_card_code', $identifier)
                    ->first();

                if (! $user) {
                    $errors[] = 'Row '.($imported + 2).": user not found for {$identifier}";

                    continue;
                }

                DuesPayment::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'type' => $data['type'] ?? 'dues',
                    'payment_method' => $data['payment_method'] ?? 'cash',
                    'reference_number' => $data['reference_number'] ?? null,
                    'period_coverage' => $data['period_coverage'] ?? null,
                    'status' => 'approved',
                    'admin_id' => $request->user()->id,
                    'notes' => $data['notes'] ?? 'Imported via CSV upload',
                ]);

                $imported++;
            }
        }

        fclose($handle);

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
            'type' => $request->type,
        ]);
    }
}
