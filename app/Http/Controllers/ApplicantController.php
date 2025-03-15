<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ApplicantController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('show', 10);
        $orderBy = $request->query('orderBy', 'created_at');
        $order = $request->query('order', 'desc');

        return response()->json(Applicant::orderBy($orderBy, $order)->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:applicants,email',
            'phone' => 'nullable|string|max:20',
            'applied_for' => 'nullable|string|max:255',
            'experience' => 'nullable|integer|min:0',
            'branch' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $applicant = new Applicant($request->only(['name', 'email', 'phone', 'applied_for', 'experience', 'branch']));
        
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('applicants', 'public');
            $applicant->file_path = $path;
        }

        $applicant->save();

        return response()->json($applicant, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Applicant $applicant)
    {
        return response()->json($applicant);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Applicant $applicant)
    {
        $applicant->update($request->all());
        $applicant->save();
        return response()->json($applicant);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Applicant $applicant)
    {
        if ($applicant->file_path) {
            Storage::disk('public')->delete($applicant->file_path);
        }
        $applicant->delete();
        return response()->json(['message' => 'Applicant deleted successfully']);
    }

}
