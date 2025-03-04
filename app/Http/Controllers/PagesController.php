<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;

class PagesController extends Controller
{
    public function home()
    {
        return Inertia::render('Home');
    }
    public function dashboard()
    {
        return Inertia::render('Dashboard');
    }
    public function categories()
    {
        return Inertia::render('Categories');
    }
    public function products()
    {
        return Inertia::render('Products');
    }
    public function news()
    {
        return Inertia::render('NewsEvents');
    }
    public function career()
    {
        return Inertia::render('Career');
    }
    public function enquiries()
    {
        return Inertia::render('Enquiries');
    }

    public function welcome()
    {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
}
