<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PostImageController extends Controller
{
    
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Post $post)
    {
        $validator = Validator::make($request->all(), [
            'images'   => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ], [
            'images.required' => 'At least one image is required.',
            'images.*.image' => 'Each file must be an image.',
            'images.*.mimes' => 'Allowed formats: jpeg, png, jpg, gif, svg.',
            'images.*.max' => 'Maximum file size is 2MB per image.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $uploadedImages = [];

        foreach ($request->file('images') as $image) {
            $path = $image->store('post_images', 'public');

            $postImage = PostImage::create([
                'post_id' => $post->id,
                'image_path' => $path,
            ]);

            $uploadedImages[] = $postImage;
        }

        return response()->json([
            'message' => 'Images uploaded successfully',
            'images' => $uploadedImages,
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PostImage $postImage)
    {
        // Delete image from storage
        if (Storage::disk('public')->exists($postImage->image_path)) {
            Storage::disk('public')->delete($postImage->image_path);
        }

        // Delete record from database
        $postImage->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }
}
