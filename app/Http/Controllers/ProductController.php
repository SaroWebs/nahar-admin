<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('show', 10);
        $orderBy = $request->query('orderBy', 'created_at');
        $order = $request->query('order', 'desc');
        
        if($request->query('show') == 'all'){
            $data = Product::with(['images','category'])->get();
        }else{
            $data = Product::with(['images','category'])->orderBy($orderBy, $order)->paginate($perPage);
        }
        
        return response()->json($data);
    }
    

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'variant' => 'in:whole,powder,flakes,slice,na',
            'trade_name' => 'nullable|string',
            'other_names' => 'nullable|string',
            'general_info' => 'nullable|string',
            'origin_sourcing' => 'nullable|string',
            'quality_certifications' => 'nullable|string',
            'characteristics' => 'nullable|string',
            'packaging_shelf_life' => 'nullable|string',
            'moq' => 'nullable|string',
            'badge_ids' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $product = Product::create($request->except('images'));

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('product_images', 'public');
                ProductImage::create([ 'product_id' => $product->id, 'image_path' => $path ]);
            }
        }

        return response()->json($product->load('images'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json($product->load('images'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'variant' => 'sometimes|in:whole,powder,flakes,slice,na',
            'trade_name' => 'nullable|string',
            'other_names' => 'nullable|string',
            'general_info' => 'nullable|string',
            'origin_sourcing' => 'nullable|string',
            'quality_certifications' => 'nullable|string',
            'characteristics' => 'nullable|string',
            'packaging_shelf_life' => 'nullable|string',
            'moq' => 'nullable|string',
            'badge_ids' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $product->update($request->all());
        return response()->json($product->load('images'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $images = $product->images;
        foreach ($images as $image) {
            if (file_exists(public_path($image->image_path))) {
                unlink(public_path($image->image_path)); 
            }
        }
        $product->images()->delete();
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Upload images separately.
     */
    public function uploadImages(Request $request, $product_id)
    {
        $validator = Validator::make($request->all(), [
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $product = Product::findOrFail($product_id);

        $uploadedImages = [];
        foreach ($request->file('images') as $image) {
            $path = $image->store('product_images', 'public');
            $uploadedImages[] = ProductImage::create(['product_id' => $product->id, 'image_path' => $path]);
        }

        return response()->json($uploadedImages, 201);
    }
}
