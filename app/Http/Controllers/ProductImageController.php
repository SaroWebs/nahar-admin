<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductImageController extends Controller
{
    /**
     * Store newly uploaded images for a product.
     */
    public function store(Request $request, Product $product)
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
            $path = $image->store('product_images', 'public');

            $productImage = ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
            ]);

            $uploadedImages[] = $productImage;
        }

        return response()->json([
            'message' => 'Images uploaded successfully',
            'images' => $uploadedImages,
        ], 201);
    }

    /**
     * Remove the specified product image from storage.
     */
    public function destroy(ProductImage $productImage)
    {
        // Delete image from storage
        if (Storage::disk('public')->exists($productImage->image_path)) {
            Storage::disk('public')->delete($productImage->image_path);
        }

        // Delete record from database
        $productImage->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }
}
