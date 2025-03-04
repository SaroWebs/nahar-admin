<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('show', 10);
        $orderBy = $request->query('orderBy', 'created_at');
        $order = $request->query('order', 'desc');
        
        if($request->query('show') == 'all'){
            $categories = Category::get();
        }else{
            $categories = Category::orderBy($orderBy, $order)->paginate($perPage);
        }
        
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:natural,organic,na',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'nullable|string',
        ]);

        $data = $request->only(['name','type', 'description']);
        $data['slug'] = Str::slug($request->type.'-'.$request->name);

        if ($request->hasFile('banner')) {
            $data['banner_path'] = $request->file('banner')->store('categories', 'public');
        }
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $category = Category::create($data);
        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
       $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:natural,organic,na',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'nullable|string',
        ]);
        
        $data = $request->only(['name','type', 'description']);
        $data['slug'] = Str::slug($request->type.'-'.$request->name);
        
        if ($request->hasFile('banner')) {
            if ($category->banner_path) {
                Storage::disk('public')->delete($category->banner_path);
            }
            $data['banner_path'] = $request->file('banner')->store('categories', 'public');
        }
        if ($request->hasFile('image')) {
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);
        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        if ($category->banner_path) {
            Storage::disk('public')->delete($category->banner_path);
        }
        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
    
}
