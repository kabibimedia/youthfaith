<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Devotional;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DevotionalController extends Controller
{
    public function index(): JsonResponse
    {
        $devotionals = Devotional::orderByDesc('devotional_date')->get();

        return response()->json($devotionals);
    }

    public function today(): JsonResponse
    {
        $devotional = Devotional::where('devotional_date', now()->toDateString())->first();

        if (! $devotional) {
            $devotional = Devotional::orderByDesc('devotional_date')->first();
        }

        return response()->json($devotional);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'verse' => 'required|string|max:255',
            'devotional_date' => 'required|date',
        ]);

        $devotional = Devotional::create($request->all());

        return response()->json($devotional, 201);
    }

    public function show(int $id): JsonResponse
    {
        $devotional = Devotional::findOrFail($id);

        return response()->json($devotional);
    }
}
