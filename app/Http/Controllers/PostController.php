<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Post;
use App\Models\PostImage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('show', 10);
        $orderBy = $request->query('orderBy', 'created_at');
        $order = $request->query('order', 'desc');

        return response()->json(Post::with('images')->orderBy($orderBy, $order)->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'slug'        => 'nullable|string|unique:posts,slug',
            'type'        => 'required|in:news,event,blog',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Create the post with mass assignment
        $post = Post::create([
            'title'       => $request->title,
            'type'        => $request->type,
            'description' => $request->description,
            'slug'        => $request->slug ?? Str::slug($request->title),
        ]);

        return response()->json($post->load('images'), 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return response()->json($post->load('images'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'type'        => 'required|in:news,event,blog',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Update post details
        $post->update([
            'title'       => $request->title,
            'type'        => $request->type,
            'description' => $request->description,
            'slug'        => $request->slug ?? Str::slug($request->title),
        ]);

        return response()->json($post->load('images'));
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        foreach ($post->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully']);
    }

}
