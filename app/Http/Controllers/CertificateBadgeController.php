<?php

namespace App\Http\Controllers;

use App\Models\CertificateBadge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class CertificateBadgeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(CertificateBadge::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $badge = new CertificateBadge($request->only(['title', 'description']));

        if ($request->hasFile('image')) {
            $badge->image_path = $request->file('image')->store('certificate_badges', 'public');
        }

        $badge->save();

        return response()->json($badge, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CertificateBadge $certificateBadge)
    {
        return response()->json($certificateBadge);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CertificateBadge $certificateBadge)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $certificateBadge->update($request->only(['title', 'description']));

        if ($request->hasFile('image')) {
            if ($certificateBadge->image_path) {
                Storage::disk('public')->delete($certificateBadge->image_path);
            }
            $certificateBadge->image_path = $request->file('image')->store('certificate_badges', 'public');
            $certificateBadge->save();
        }

        return response()->json($certificateBadge);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CertificateBadge $certificateBadge)
    {
        if ($certificateBadge->image_path) {
            Storage::disk('public')->delete($certificateBadge->image_path);
        }
        $certificateBadge->delete();
        return response()->json(['message' => 'Certificate badge deleted successfully']);
    }
}
