<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = Post::with([
            'user:id,name,avatar',
            'comments.user:id,name,avatar',
            'comments.replies.user:id,name,avatar',
            'sharedFrom.user:id,name,avatar',
        ])
            ->orderByDesc('created_at')
            ->get();

        $userId = auth()->id();

        $posts = $posts->map(function ($post) use ($userId) {
            $likes = $post->likes()->get();
            $post->reactions_count = $likes->count();
            $post->user_reacted = null;
            $post->reactions = [];

            $emojiCounts = [];
            foreach ($likes as $like) {
                $emoji = $like->emoji ?? 'like';
                $emojiCounts[$emoji] = ($emojiCounts[$emoji] ?? 0) + 1;
            }
            $post->reactions = $emojiCounts;

            if ($userId) {
                $like = $likes->where('user_id', $userId)->first();
                if ($like) {
                    $post->user_reacted = $like->emoji ?? 'like';
                }
            }

            return $post;
        });

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $postType = $request->input('post_type', 'text');

        $rules = [
            'content' => 'required|string|max:2000',
            'post_type' => 'nullable|in:text,image,video,reel,live',
        ];

        $mimeRules = 'nullable';
        if ($postType === 'image') {
            $mimeRules = 'required|file|mimes:jpeg,png,jpg,gif,webp|max:10240';
        } elseif (in_array($postType, ['video', 'reel'])) {
            $mimeRules = 'required|file|mimes:mp4,webm|max:51200';
        } elseif ($postType === 'live') {
            $mimeRules = 'nullable';
        }

        $rules['media'] = $mimeRules;
        $request->validate($rules);

        $post = $request->user()->posts()->create([
            'content' => $request->content,
            'post_type' => $postType,
        ]);

        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('posts', 'public');
            $mime = $request->file('media')->getMimeType();
            $post->update([
                'media_url' => $path,
                'media_type' => str_contains($mime, 'video') ? 'video' : 'image',
            ]);
        }

        $post->load(['user', 'comments.user', 'likes']);

        return response()->json($post, 201);
    }

    public function show(int $id): JsonResponse
    {
        $post = Post::with(['user', 'comments.user', 'likes'])->findOrFail($id);

        return response()->json($post);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $post = $request->user()->posts()->findOrFail($id);

        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $post->update([
            'content' => $request->content,
        ]);

        $post->load(['user:id,name,avatar', 'comments.user:id,name,avatar', 'likes']);

        return response()->json($post);
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $post = $request->user()->posts()->findOrFail($id);

        if ($post->media_url) {
            Storage::disk('public')->delete($post->media_url);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted']);
    }

    public function like(int $id, Request $request): JsonResponse
    {
        $post = Post::findOrFail($id);
        $user = $request->user();
        $emoji = $request->input('emoji', 'fire');

        $existingLike = $post->likes()->where('user_id', $user->id)->first();

        if ($existingLike) {
            if ($existingLike->emoji === $emoji) {
                $existingLike->delete();
            } else {
                $existingLike->update(['emoji' => $emoji]);
            }
        } else {
            $post->likes()->create(['user_id' => $user->id, 'emoji' => $emoji]);
            $user->increment('points', 2);
        }

        $likes = $post->likes()->get();
        $emojiCounts = [];
        foreach ($likes as $like) {
            $e = $like->emoji ?? 'like';
            $emojiCounts[$e] = ($emojiCounts[$e] ?? 0) + 1;
        }

        return response()->json([
            'liked' => true,
            'emoji' => $emoji,
            'reactions_count' => $likes->count(),
            'reactions' => $emojiCounts,
        ]);
    }

    public function comment(int $id, Request $request): JsonResponse
    {
        $request->validate(['comment' => 'required|string|max:500']);

        $post = Post::findOrFail($id);
        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'parent_id' => $request->input('parent_id'),
            'comment' => $request->comment,
        ]);

        $request->user()->increment('points', 1);
        $comment->load(['user', 'replies.user']);

        return response()->json($comment, 201);
    }

    public function comments(int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $comments = $post->comments()
            ->with(['user', 'replies.user', 'replies.replies.user'])
            ->whereNull('parent_id')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($comments);
    }

    public function share(int $id, Request $request): JsonResponse
    {
        $originalPost = Post::findOrFail($id);
        $user = $request->user();

        $sharedPost = $user->posts()->create([
            'content' => $originalPost->content,
            'media_url' => $originalPost->media_url,
            'media_type' => $originalPost->media_type,
            'post_type' => $originalPost->post_type,
            'shared_from_post_id' => $originalPost->id,
        ]);

        $originalPost->increment('shares_count');

        $sharedPost->load(['user:id,name,avatar', 'sharedFrom.user:id,name,avatar']);

        return response()->json($sharedPost, 201);
    }
}
