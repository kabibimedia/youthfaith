<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        $blogs = Blog::with('author:id,name')
            ->published()
            ->latest('published_at')
            ->paginate(12);

        return response()->json($blogs);
    }

    public function show(int $id): JsonResponse
    {
        $blog = Blog::with('author:id,name')
            ->published()
            ->findOrFail($id);

        return response()->json($blog);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|url|max:2048',
            'video_url' => 'nullable|url|max:2048',
            'is_published' => 'sometimes|boolean',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['published_at'] = ($validated['is_published'] ?? false) ? now() : null;

        $blog = Blog::create($validated);

        return response()->json($blog->load('author:id,name'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $blog = Blog::findOrFail($id);

        if ($blog->user_id !== $request->user()->id && ! $request->user()->is_admin) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|url|max:2048',
            'video_url' => 'nullable|url|max:2048',
            'is_published' => 'sometimes|boolean',
        ]);

        if (isset($validated['is_published']) && $validated['is_published'] && ! $blog->published_at) {
            $validated['published_at'] = now();
        }

        $blog->update($validated);

        return response()->json($blog->load('author:id,name'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $blog = Blog::findOrFail($id);

        if ($blog->user_id !== $request->user()->id && ! $request->user()->is_admin) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $blog->delete();

        return response()->json(['message' => 'Blog deleted']);
    }

    public function myBlogs(Request $request): JsonResponse
    {
        $blogs = Blog::with('author:id,name')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json($blogs);
    }
}
