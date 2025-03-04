<?php

namespace App\Http\Controllers;

use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnquiryController extends Controller
{
    public function index()
    {
        return response()->json(Enquiry::all());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'message' => 'nullable|string',
            'website' => 'nullable|string|max:255',
            'product' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'city' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'pin' => 'nullable|string|max:10',
            'branch_type' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $enquiry = Enquiry::create($request->all());

        return response()->json($enquiry, 201);
    }

    public function show(Enquiry $enquiry)
    {
        return response()->json($enquiry);
    }

    public function update(Request $request, Enquiry $enquiry)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'message' => 'nullable|string',
            'website' => 'nullable|string|max:255',
            'product' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'city' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'pin' => 'nullable|string|max:10',
            'branch_type' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $enquiry->update($request->all());

        return response()->json($enquiry);
    }

    public function destroy(Enquiry $enquiry)
    {
        $enquiry->delete();
        return response()->json(['message' => 'Enquiry deleted successfully']);
    }
}
