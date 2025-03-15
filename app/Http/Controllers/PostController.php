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
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:posts,slug',
            'type' => 'required|in:news,event,blog',
            'description' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $post = new Post($request->only(['title', 'type', 'description']));
        $post->slug = $request->slug ?? Str::slug($request->title);
        // if (isset($request->start_date) && $request->start_date !== '' && $request->start_date !== null) {
        //     $post->start_date = Carbon::parse($request->start_date);
        // }
        
        // if (isset($request->end_date) && $request->end_date !== '' && $request->end_date !== null) {
        //     $post->end_date = Carbon::parse($request->end_date);
        // }

        $post->save();

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('post_images', 'public');
                PostImage::create(['post_id' => $post->id, 'image_path' => $path]);
            }
        }

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
        $post->update($request->all());
        $post->slug = $request->slug ?? Str::slug($request->title);
        $post->save();

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('post_images', 'public');
                PostImage::create(['post_id' => $post->id, 'image_path' => $path]);
            }
        }

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
