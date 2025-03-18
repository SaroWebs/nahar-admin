<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('category_id')->constraint('categories')->cascadeOnDelete();
            $table->enum('variant',['whole','powder','flakes','slice','na'])->default('na');
            $table->string('botanical_name')->nullable();
            $table->string('trade_name')->nullable();
            $table->json('other_names')->nullable();
            $table->text('general_info')->nullable();
            $table->text('origin_sourcing')->nullable();
            $table->text('quality_certifications')->nullable();
            $table->text('characteristics')->nullable();
            $table->text('packaging_shelf_life')->nullable();
            $table->text('moq')->nullable();
            $table->string('badge_ids')->nullable();
            $table->enum('status',['pending','active','inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
