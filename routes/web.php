<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PagesController;
use App\Http\Controllers\EnquiryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ApplicantController;
use App\Http\Controllers\PostImageController;
use App\Http\Controllers\SubcategoryController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\CertificateBadgeController;

Route::get('/link', function () {
    Artisan::call('storage:link');
    return "Storage link created successfully!";
});

Route::controller(PagesController::class)->group(function(){
    Route::get('/', 'home');
    Route::get('/welcome', 'welcome');
});


Route::middleware('auth')->group(function () {
    Route::controller(PagesController::class)->group(function(){
        Route::get('/dashboard', 'dashboard')->middleware(['verified'])->name('dashboard');
        Route::get('/categories', 'categories');
        Route::get('/products', 'products');
        Route::get('/news', 'news');
        Route::get('/career', 'career');
        Route::get('/enquiries', 'enquiries');
    });

    Route::controller(ProfileController::class)->group(function(){
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
    });

    Route::apiResource('data/categories', CategoryController::class);

    // products 
    Route::apiResource('data/products', ProductController::class);
    Route::post('data/products/{product}/images', [ProductImageController::class, 'store']);
    Route::delete('data/product_images/{productImage}', [ProductImageController::class, 'destroy']);

    Route::apiResource('data/certificate-badges', CertificateBadgeController::class);
    Route::apiResource('data/posts', PostController::class);
    Route::post('data/posts/{post}/images', [PostImageController::class, 'store']);
    Route::delete('data/post_images/{postImage}', [PostImageController::class, 'destroy']);
    Route::apiResource('data/applicants', ApplicantController::class);
    Route::apiResource('data/enquiries', EnquiryController::class);
});

require __DIR__.'/auth.php';
